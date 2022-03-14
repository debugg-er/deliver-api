import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Conversation, Message, Participant } from '@entities';

@Injectable()
export class ConversationService {
    constructor(
        @InjectRepository(Conversation)
        private readonly conversationRepository: Repository<Conversation>,
    ) {}

    public async findConversationById(id: number) {
        const conversation = await this.conversationRepository.findOne(id);
        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }
        return conversation;
    }

    public async findUserConversations(
        username: string,
    ): Promise<Array<Conversation & { lastMessage: Message | null }>> {
        const conversations = await this.conversationRepository
            .createQueryBuilder('conversation')
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
                'msg.conversation_id = participant.conversation_id AND msg.created_at = message.createdAt',
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
            // .andWhere('participant.removedAt IS NULL')
            .orderBy('message.createdAt', 'DESC')
            .getMany();

        return conversations.map((conversation) => {
            const conv: any = { ...conversation };
            conv.lastMessage = conv.messages[0] || null;
            delete conv.messages;
            return conv;
        });
    }
}
