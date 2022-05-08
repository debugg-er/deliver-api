import { QueryFailedError, Repository, SelectQueryBuilder } from 'typeorm';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Attachment, Contact, Conversation, Message, Participant } from '@entities';
import { PagingationDto } from '@generals/pagination.dto';
import {
    CreateConversationDto,
    FindConversationDto,
    UpdateConversationDto,
} from './conversation.dto';
import { PostgresError } from 'pg-error-enum';

// 🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸
@Injectable()
export class ConversationService {
    constructor(
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(Participant)
        private readonly participantRepository: Repository<Participant>,
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,

        private readonly eventEmitter: EventEmitter2,
    ) {}

    public async findConversationById(
        username: string,
        conversationId: number,
    ): Promise<Conversation> {
        return this.findAndCheckConversation(username, conversationId);
    }

    public async findConversationByUsername(user1: string, user2: string): Promise<Conversation> {
        const conversation = await this.conversationRepository
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.participants', 'cp')
            .innerJoinAndSelect('cp.user', 'cpu')
            .leftJoinAndSelect('c.lastMessage', 'l')
            .leftJoinAndSelect('l.participant', 'lp')
            .leftJoinAndSelect('lp.user', 'lpu')
            .innerJoin('cp.conversation', 'cpc')
            .leftJoin('cpc.participants', 'cpcp')
            .where('c.type = :conversationType', { conversationType: 'personal' })
            .andWhere('cp.user = :user1', { user1 })
            .andWhere('cpcp.user = :user2', { user2 })
            .getOne();

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }
        return conversation;
    }

    public async findUserConversations(
        username: string,
        dto: FindConversationDto,
    ): Promise<Array<Conversation>> {
        function findConversationIdsQuery(qb: SelectQueryBuilder<any>): string {
            qb = qb
                .subQuery()
                .select('p.conversation_id')
                .from(Participant, 'p')
                .innerJoin(Conversation, 'c', 'c.id = p.conversation_id')
                .where('p.user = :username', { username })
                .andWhere('p.removedAt IS NULL');

            switch (dto.type) {
                case 'group':
                    qb = qb.andWhere('c.type = :type', { type: 'group' });
                    break;
                case 'friend':
                case 'stranger':
                    qb = qb
                        .innerJoin(
                            Participant,
                            'p2',
                            'p.conversation_id = p2.conversation_id AND p.id <> p2.id',
                        )
                        .andWhere('c.type = :type', { type: 'personal' })
                        .andWhere(
                            (qb2) =>
                                `p2.user ${dto.type === 'stranger' ? 'NOT' : ''} IN ` +
                                qb2
                                    .subQuery()
                                    .select('user_2')
                                    .from(Contact, 'ct')
                                    .where('user_1 = :username', { username })
                                    .andWhere(`status = :status`, { status: 'friend' })
                                    .getQuery(),
                        );
                    break;
            }

            return 'conversation.id IN ' + qb.getQuery();
        }

        const conversations = await this.conversationRepository
            .createQueryBuilder('conversation')
            .leftJoinAndSelect('conversation.participants', 'participant')
            .innerJoinAndSelect('participant.user', 'user')
            .innerJoinAndSelect('conversation.lastMessage', 'last_message')
            .leftJoinAndSelect('last_message.attachments', 'attachments')
            .innerJoinAndSelect('last_message.participant', 'lm_participant')
            .innerJoinAndSelect('lm_participant.user', 'lm_user')
            .where(findConversationIdsQuery)
            .andWhere('participant.removedAt IS NULL')
            .orderBy('last_message.createdAt', 'DESC')
            .skip(dto.offset)
            .take(dto.limit)
            .getMany();

        if (conversations.length === 0) {
            return [];
        }

        const conversationIds = conversations.map((c) => c.id);

        const lastMessageStatuses = await this.participantRepository
            .createQueryBuilder('participant')
            .select('participant.conversation_id', 'conversationId')
            .addSelect('participant.id', 'participantId')
            .addSelect('COALESCE(seen_message_id      = last_message_id, FALSE)', 'seen')
            .addSelect('COALESCE(delivered_message_id = last_message_id, FALSE)', 'delivered')
            .addSelect('message_group.message_ahead', 'messageAhead')
            .innerJoin('participant.conversation', 'conversation')
            .innerJoin(
                (qb) =>
                    qb
                        .select(
                            'SUM(CASE WHEN m.id > COALESCE(p.seen_message_id, 0) THEN 1 ELSE 0 END)::INT',
                            'message_ahead',
                        )
                        .addSelect('p.conversation', 'conversation_id2')
                        .from(Participant, 'p')
                        .innerJoin(Participant, 'pa', 'pa.conversation_id = p.conversation_id')
                        .innerJoin(Message, 'm', 'm.participant_id = pa.id')
                        .where('p.user = :username', { username })
                        .groupBy('p.conversation_id'),
                'message_group',
                'message_group.conversation_id2 = conversation.id',
            )
            .where('participant.user = :username', { username })
            .andWhere('conversation_id IN (:...conversationIds)', { conversationIds })
            .getRawMany();

        return conversations.map((conversation) => {
            const lastMessageStatus = lastMessageStatuses.find(
                (lms) => lms.conversationId === conversation.id,
            );
            conversation._type = dto.type === 'group' ? undefined : dto.type;
            return { ...conversation, ...lastMessageStatus };
        });
    }

    public async findConversationParticipants(
        username: string,
        conversationId: number,
        pagination: PagingationDto,
    ): Promise<Array<Participant>> {
        const participants = await this.participantRepository
            .createQueryBuilder('p')
            .innerJoinAndSelect('p.user', 'u')
            .where('p.conversation_id = :conversationId', { conversationId })
            .skip(pagination.offset)
            .take(pagination.limit)
            .getMany();

        if (participants.length === 0) {
            throw new NotFoundException('Conversation not found');
        }
        if (participants.every((p) => p.user.username !== username)) {
            throw new ForbiddenException('You are not in this conversation');
        }
        return participants;
    }

    public async findConversationMessagesAndUpdateParticipantStatus(
        username: string,
        conversationId: number,
        pagination: PagingationDto,
    ): Promise<Array<Message>> {
        const participants = await this.participantRepository
            .createQueryBuilder('p')
            .addSelect('p.seenMessageId')
            .addSelect('p.deliveredMessageId')
            .innerJoinAndSelect('p.user', 'u')
            .where('p.conversation_id = :conversationId', { conversationId })
            .getMany();

        if (participants.length === 0) {
            throw new NotFoundException('Conversation not found');
        }
        if (participants.every((p) => p.user.username !== username)) {
            throw new ForbiddenException('You are not in this conversation');
        }
        const messages = await this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.reactions', 'mr')
            .leftJoinAndSelect('message.attachments', 'ma')
            .innerJoinAndSelect('message.participant', 'participant')
            .innerJoinAndSelect('participant.user', 'user')
            .loadRelationCountAndMap('message.reactionCount', 'message.reactions')
            .where('participant.conversation_id = :conversationId', { conversationId })
            .orderBy('message.id', 'DESC')
            .skip(pagination.offset)
            .take(pagination.limit)
            .getMany();

        if (pagination.offset === 0 && messages.length > 0) {
            const me = participants.find((p) => p.user.username === username) as Participant;
            me.seenMessageId = messages[0].id;
            me.deliveredMessageId = messages[0].id;
            await this.participantRepository.save(me);
        }

        return messages.map((message) => {
            message.seenParticipants = participants.filter(
                (p) => +(p.seenMessageId || 0) >= +message.id,
            );
            message.deliveredParticipants = participants.filter(
                (p) => +(p.deliveredMessageId || 0) >= +message.id,
            );
            if (message.revokedAt) {
                message.content = '';
                message.attachments = [];
            }
            return message;
        });
    }

    public async createConveration(
        creatorUsername: string,
        dto: CreateConversationDto,
    ): Promise<Conversation> {
        if (dto.type === 'personal') {
            const conversationParticipant = await this.participantRepository
                .createQueryBuilder('p')
                .innerJoin('p.conversation', 'c')
                .innerJoin('c.participants', 'cp')
                .where('p.user = :creatorUsername', { creatorUsername })
                .andWhere('c.type = :type', { type: 'personal' })
                .andWhere('cp.user = :participantUsername', {
                    participantUsername: dto.participantUsernames[0],
                })
                .getOne();

            if (conversationParticipant) {
                throw new BadRequestException('Conversation existed');
            }
        }

        const conversation = this.conversationRepository.create({ type: dto.type });
        await this.conversationRepository.insert(conversation);

        const creatorParticipant = this.participantRepository.create({
            user: { username: creatorUsername },
            role: dto.type === 'group' ? 'admin' : undefined,
            conversation: { id: conversation.id },
        });
        conversation.participants = [
            creatorParticipant,
            ...dto.participantUsernames.map((username) =>
                this.participantRepository.create({
                    user: { username },
                    role: dto.type === 'group' ? 'member' : undefined,
                    conversation: { id: conversation.id },
                }),
            ),
        ];

        try {
            await this.participantRepository.insert(conversation.participants);
            if (dto.type === 'group') {
                await this.messageRepository.insert(
                    this.messageRepository.create({
                        content: creatorUsername + ' Đã tạo nhóm trò chuyện',
                        type: 'update',
                        participant: creatorParticipant,
                    }),
                );
            }
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.code === PostgresError.FOREIGN_KEY_VIOLATION) {
                    await this.conversationRepository.delete({ id: conversation.id });
                    throw new BadRequestException('Username does not exist');
                }
            }
            throw err;
        }

        const fullConveration = await this.findConversationById(creatorUsername, conversation.id);
        this.eventEmitter.emit('conversation_created', fullConveration);
        return fullConveration;
    }

    public async findConversationMedia(
        username: string,
        conversationId: number,
        pagination: PagingationDto,
    ): Promise<Array<Attachment>> {
        await this.findAndCheckConversation(username, conversationId);

        const attachments = await this.attachmentRepository
            .createQueryBuilder('a')
            .addSelect('p.conversationId')
            .innerJoinAndSelect('a.message', 'm')
            .innerJoinAndSelect('m.participant', 'p')
            .innerJoinAndSelect('p.user', 'u')
            .where('p.conversation_id = :conversationId', { conversationId })
            .andWhere('m.revokedAt IS NULL')
            .andWhere('a.type IN (:...types)', { types: ['image', 'video'] })
            .orderBy('a.id', 'DESC')
            .skip(pagination.offset)
            .take(pagination.limit)
            .getMany();

        return attachments;
    }

    private async findAndCheckConversation(
        username: string,
        conversationId: number,
    ): Promise<Conversation> {
        const conversation = await this.conversationRepository
            .createQueryBuilder('c')
            .leftJoinAndSelect('c.participants', 'p')
            .leftJoinAndSelect('c.lastMessage', 'lm')
            .leftJoinAndSelect('lm.attachments', 'lma')
            .innerJoinAndSelect('p.user', 'u')
            .leftJoinAndSelect('lm.participant', 'lmp')
            .leftJoinAndSelect('lmp.user', 'lmpu')
            .where('c.id = :conversationId', { conversationId })
            .getOne();

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }
        const myParticipant = conversation.participants.find((p) => p.user.username === username);
        if (!myParticipant || myParticipant.removedAt !== null) {
            throw new UnauthorizedException('You are not in this conversation');
        }

        return conversation;
    }

    async updateConversation(username: string, conversationId: number, dto: UpdateConversationDto) {
        const conversation = await this.findAndCheckConversation(username, conversationId);
        if (
            dto.removeParticipants?.length > 0 &&
            !conversation.participants.some(
                (p) => p.user.username === username && p.role === 'admin',
            )
        ) {
            throw new UnauthorizedException('You are not admin in this group');
        }
        const myParticipant = conversation.participants.find(
            (p) => p.user.username === username,
        ) as Participant;

        const messages: Array<Message> = [];

        if (conversation.type === 'group') {
            if (dto.addParticipantUsernames) {
                dto.addParticipantUsernames = dto.addParticipantUsernames.filter(
                    (u) => u !== username,
                );
                try {
                    const existingParticipants = conversation.participants.filter((p) =>
                        dto.addParticipantUsernames.includes(p.user.username),
                    );
                    existingParticipants.forEach((p) => (p.removedAt = null));
                    const newParticipants = dto.addParticipantUsernames
                        .filter(
                            (usrn) =>
                                !conversation.participants.find((p) => p.user.username === usrn),
                        )
                        .map((username) =>
                            this.participantRepository.create({
                                user: { username },
                                role: 'member',
                                conversation: { id: conversation.id },
                                conversationId: conversation.id,
                            }),
                        );
                    const ps = [...existingParticipants, ...newParticipants];
                    await this.participantRepository.save(ps);
                    ps.forEach((p) => {
                        p.conversation = { id: conversation.id } as any;
                        this.eventEmitter.emit('participant_added', p);
                    });
                    messages.push(
                        ...ps.map((p) =>
                            this.messageRepository.create({
                                content: `${username} Đã thêm ${p.user.username} vào nhóm`,
                                type: 'update',
                                participant: myParticipant,
                            }),
                        ),
                    );
                } catch (err) {
                    if (err instanceof QueryFailedError) {
                        if (err.driverError.code === PostgresError.FOREIGN_KEY_VIOLATION) {
                            await this.conversationRepository.delete({ id: conversation.id });
                            throw new BadRequestException('Username does not exist');
                        }
                    }
                    throw err;
                }
            }

            if (dto.removeParticipants) {
                dto.removeParticipants = dto.removeParticipants.filter(
                    (pid) => pid !== myParticipant.id,
                );
                const participantsWillBeRemove = conversation.participants.filter((p) =>
                    dto.removeParticipants.includes(p.id),
                );
                participantsWillBeRemove.forEach((p) => (p.removedAt = new Date()));
                await this.participantRepository.save(participantsWillBeRemove);
                participantsWillBeRemove.forEach((p) => {
                    p.conversation = { id: conversation.id } as any;
                    this.eventEmitter.emit('participant_removed', p);
                });
                messages.push(
                    ...participantsWillBeRemove.map((p) =>
                        this.messageRepository.create({
                            content: `${username} Xóa ${p.user.username} ra khỏi nhóm`,
                            type: 'update',
                            participant: myParticipant,
                        }),
                    ),
                );
            }
        }

        conversation.title = dto.title || conversation.title;
        await this.conversationRepository.save(conversation);
        await this.messageRepository.save(messages);

        const ms = await this.findConversationMessagesAndUpdateParticipantStatus(
            username,
            conversationId,
            {
                offset: 0,
                limit: messages.length,
            },
        );
        const c = await this.findConversationById(username, conversationId);
        ms.forEach((m) => {
            m.participant.conversation = c;
            this.eventEmitter.emit('message_created', m);
        });

        return c;
    }

    async leaveConversation(username: string, conversationId: number) {
        const conversation = await this.findAndCheckConversation(username, conversationId);
        const me = conversation.participants.find(
            (p) => p.user.username === username,
        ) as Participant;

        const role = me.role;
        me.removedAt = new Date();
        me.role = 'member';
        await this.participantRepository.save(me);

        if (role) {
            const firstOne = conversation.participants.find((p) => p.removedAt !== null);
            if (firstOne) {
                firstOne.role = 'admin';
                await this.participantRepository.save(firstOne);
            }
        }
    }
}
