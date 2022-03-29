import { QueryFailedError, Repository } from 'typeorm';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Conversation, Message, Participant } from '@entities';
import { PagingationDto } from '@generals/pagination.dto';
import { CreateConversationDto } from './conversation.dto';
import { PostgresError } from 'pg-error-enum';
import { EventGateway } from '@app/event';

// 🛸🛸🛸🛸🛸🛸🛸🛸🛸🛸
@Injectable()
export class ConversationService {
    constructor(
        private readonly eventGateway: EventGateway,

        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(Participant)
        private readonly participantRepository: Repository<Participant>,
    ) {}

    public async findConversationById(
        username: string,
        conversationId: number,
    ): Promise<Conversation> {
        const conversation = await this.conversationRepository
            .createQueryBuilder('conversation')
            .leftJoinAndSelect('conversation.participants', 'participant')
            .innerJoinAndSelect('participant.user', 'user')
            .leftJoinAndSelect('conversation.lastMessage', 'lastMessage')
            .leftJoinAndSelect('lastMessage.participant', 'p')
            .leftJoinAndSelect('p.user', 'u')
            .where('conversation.id = :conversationId', { conversationId })
            .getOne();

        if (!conversation) {
            throw new NotFoundException("Conversation not found or you're not in the conversation");
        }
        return conversation;
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
            .where('cp.user = :user1', { user1 })
            .andWhere('cpcp.user = :user2', { user2 })
            .getOne();

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }
        return conversation;
    }

    public async findUserConversations(username: string): Promise<Array<Conversation>> {
        const conversations = await this.conversationRepository
            .createQueryBuilder('conversation')
            .leftJoinAndSelect('conversation.participants', 'participant')
            .innerJoinAndSelect('participant.user', 'user')
            .innerJoinAndSelect('conversation.lastMessage', 'last_message')
            .innerJoinAndSelect('last_message.participant', 'lm_participant')
            .innerJoinAndSelect('lm_participant.user', 'lm_user')
            .where(
                (qb) =>
                    'conversation.id IN ' +
                    qb
                        .subQuery()
                        .select('p.conversation_id')
                        .from(Participant, 'p')
                        .where('p.user = :username', { username })
                        .andWhere('p.removedAt IS NULL')
                        .getQuery(),
            )
            .orderBy('last_message.createdAt', 'DESC')
            .getMany();

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
            .loadRelationCountAndMap('message.reactionCount', 'message.reactions')
            .leftJoinAndSelect('message.reactions', 'mr')
            .innerJoinAndSelect('message.participant', 'participant')
            .innerJoinAndSelect('participant.user', 'user')
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

        conversation.participants = [
            this.participantRepository.create({
                user: { username: creatorUsername },
                role: dto.type === 'group' ? 'admin' : undefined,
                conversation: { id: conversation.id },
            }),
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
        } catch (err) {
            if (err instanceof QueryFailedError) {
                if (err.driverError.code === PostgresError.FOREIGN_KEY_VIOLATION) {
                    await this.conversationRepository.delete({ id: conversation.id });
                    throw new BadRequestException('Username does not exist');
                }
            }
            throw err;
        }

        const conversationWithAllData = await this.findConversationById(
            creatorUsername,
            conversation.id,
        );
        conversation.participants.forEach((participant) => {
            const socket = this.eventGateway.findSocketByUsername(participant.user.username);
            if (!socket) return;
            participant.conversation = conversationWithAllData;
            socket.handshake.auth.participants.push(participant);
            socket.join(conversation.id.toString());
        });

        return conversation;
    }
}
