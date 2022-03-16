import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Conversation, Message, Participant } from '@entities';

@Injectable()
export class ParticipantService {
    constructor(
        @InjectRepository(Participant)
        private readonly participantRepository: Repository<Participant>,
    ) {}

    public async findUserParticipants(username: string): Promise<Array<Participant>> {
        const participants = await this.participantRepository
            .createQueryBuilder('ptcp')
            .addSelect(['ptcp.seenMessageId', 'ptcp.deliveredMessageId'])
            .innerJoinAndSelect('ptcp.conversation', 'conversation')
            .leftJoinAndSelect('conversation.messages', 'message')
            .innerJoinAndSelect('message.participant', 'participant')
            .leftJoinAndSelect('message.attachments', 'attachment')
            .innerJoinAndSelect('participant.user', 'user')
            .innerJoin(
                (subQuery) =>
                    subQuery
                        .select('p.conversation_id')
                        .addSelect('MAX(m.created_at)', 'created_at')
                        .from(Message, 'm')
                        .innerJoin(Participant, 'p', 'p.id = m.participant_id')
                        // .where('p.user = :username', { username })
                        .groupBy('p.conversation_id'),
                'msg',
                `msg.conversation_id = participant.conversation_id AND
                msg.created_at = message.createdAt`,
            )
            .where(
                (qb) =>
                    'conversation.id IN ' +
                    qb
                        .subQuery()
                        .select('c.id')
                        .distinct(true)
                        .from(Conversation, 'c')
                        .innerJoin(Participant, 'p', 'p.conversation_id = c.id')
                        .where('p.user = :username', { username })
                        .andWhere('p.removedAt IS NULL')
                        .getQuery(),
            )
            .andWhere('ptcp.removedAt IS NULL')
            .where('ptcp.user = :username', { username })
            .orderBy('message.createdAt', 'DESC')
            .getMany();

        return participants.map((participant) => {
            const ptcp: any = { ...participant };
            ptcp.conversation.lastMessage = ptcp.conversation.messages[0] || null;
            ptcp.seen = ptcp.seenMessageId == ptcp.conversation.lastMessage.id;
            ptcp.delivered = ptcp.deliveredMessageId == ptcp.conversation.lastMessage.id;
            delete ptcp.conversation.messages;
            delete ptcp.seenMessageId;
            delete ptcp.deliveredMessageId;
            return ptcp;
        });
    }
}
