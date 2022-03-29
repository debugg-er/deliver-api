import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { Message, MessageReaction, Participant } from '@entities';

import { UpdateMessageDto } from './message.dto';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(MessageReaction)
        private readonly messageReactionRepository: Repository<MessageReaction>,
        @InjectRepository(Participant)
        private readonly participantRepository: Repository<Participant>,
    ) {}

    async updateMessage(username: string, messageId: string, dto: UpdateMessageDto) {
        const message = await this.messageRepository
            .createQueryBuilder('m')
            .innerJoinAndSelect('m.participant', 'p')
            .innerJoinAndSelect('p.user', 'u')
            .where('m.id = :messageId', { messageId })
            .getOne();

        if (!message) {
            throw new NotFoundException('Message not found');
        }
        if (message.participant.user.username !== username) {
            throw new ForbiddenException('Message does not belong to you');
        }
        if (message.revokedAt) {
            throw new BadRequestException('Message already revoked');
        }
        // if (Date.now() - (message.createdAt as any) > 1000 * 15) {
        //     throw new BadRequestException("Can't revoke message");
        // }
        message.revokedAt = dto.revoked ? new Date() : message.revokedAt;
        await this.messageRepository.save(message);
        return message;
    }

    async reactMessage(username: string, messageId: string, emoji: string) {
        if (!/^\p{Extended_Pictographic}$/u.test(emoji)) {
            throw new BadRequestException('Invalid emoji');
        }
        const message = await this.messageRepository.findOne(messageId, {
            relations: ['participant', 'participant.conversation'],
        });
        if (!message) {
            throw new NotFoundException('Message not found');
        }
        const participant = await this.participantRepository.findOne({
            user: { username },
            conversation: { id: message.participant.conversation.id },
        });
        if (!participant) {
            throw new BadRequestException('You are not in this conversation');
        }

        let reaction = await this.messageReactionRepository.findOne({
            participant: { id: participant.id },
            message: { id: message.id },
        });

        if (reaction) {
            reaction.emoji = emoji;
        } else {
            reaction = this.messageReactionRepository.create({
                participant: { id: participant.id },
                message: { id: message.id },
                emoji: emoji,
            });
        }
        await this.messageReactionRepository.save(reaction);
        return reaction;
    }
}
