import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Message } from '@entities';
import { PagingationDto } from '@generals/pagination.dto';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) {}

    public async findMessageBy(
        conditions: { conversationId?: number },
        pagination: PagingationDto,
    ): Promise<Array<Message>> {
        return this.messageRepository
            .createQueryBuilder('message')
            .innerJoinAndSelect('message.participant', 'participant')
            .innerJoinAndSelect('participant.user', 'user')
            .where('participant.conversation_id = :conversationId', conditions)
            .orderBy('message.createdAt', 'DESC')
            .skip(pagination.offset)
            .take(pagination.limit)
            .getMany();
    }
}
