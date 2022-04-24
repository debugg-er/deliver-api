import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as mimetype from 'mime-types';

import environment from '@environments';
import { Attachment, Message, MessageReaction, Participant } from '@entities';

import { CreateMessageDto, ReactMessageDto, UpdateMessageDto } from './message.dto';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(MessageReaction)
        private readonly messageReactionRepository: Repository<MessageReaction>,
        @InjectRepository(Participant)
        private readonly participantRepository: Repository<Participant>,
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,

        private readonly eventEmitter: EventEmitter2,
    ) {}

    async createMessage(username: string, dto: CreateMessageDto) {
        const participant = await this.participantRepository
            .createQueryBuilder('p')
            .innerJoinAndSelect('p.user', 'u')
            .innerJoinAndSelect('p.conversation', 'c')
            .leftJoinAndSelect('c.participants', 'cp')
            .leftJoinAndSelect('cp.user', 'cpu')
            .where('p.user = :username', { username })
            .andWhere('p.conversation_id = :conversationId', { conversationId: dto.conversationId })
            .getOne();

        if (!participant) {
            throw new BadRequestException(
                "You are not in this conversation or conversation does't exists",
            );
        }

        const message = await this.messageRepository.save(
            this.messageRepository.create({
                content: dto.content,
                participantId: participant.id,
                participant: participant,
                type: null,
            }),
        );

        message.attachments = [];
        if (dto.attachments) {
            for (const attachment of dto.attachments) {
                if (!fs.existsSync(path.join(environment.TEMP_FOLDER_PATH, attachment))) {
                    continue;
                }
                await fs.promises.rename(
                    path.join(environment.TEMP_FOLDER_PATH, attachment),
                    path.join(environment.PUBLIC_FOLDER_PATH, attachment),
                );

                const attachmentType = mimetype.lookup(attachment);
                const Attachment = this.attachmentRepository.create({
                    attachmentPath: '/public/' + attachment,
                    type: attachmentType
                        ? attachmentType.startsWith('video')
                            ? 'video'
                            : attachmentType.startsWith('image')
                            ? 'image'
                            : 'file'
                        : 'file',
                    message: { id: message.id },
                });
                message.attachments.push(Attachment);
            }
        }

        await this.attachmentRepository.save(message.attachments);

        message.seenParticipants = [participant];
        message.deliveredParticipants = [participant];
        message.reactions = [];

        this.eventEmitter.emit('message_created', message);
        return message;
    }

    async updateMessage(username: string, messageId: string, dto: UpdateMessageDto) {
        const message = await this.messageRepository
            .createQueryBuilder('m')
            .leftJoinAndSelect('m.attachments', 'a')
            .innerJoinAndSelect('m.participant', 'p')
            .innerJoinAndSelect('p.conversation', 'c')
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
        this.eventEmitter.emit('message_revoked', message);
        return message;
    }

    async reactMessage(username: string, messageId: string, dto: ReactMessageDto) {
        const message = await this.messageRepository.findOne(messageId, {
            relations: ['participant', 'participant.conversation', 'participant.user'],
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
            reaction.emoji = dto.emoji;
        } else {
            reaction = this.messageReactionRepository.create({
                participant: { id: participant.id },
                message: { id: message.id },
                emoji: dto.emoji,
            });
        }
        await this.messageReactionRepository.save(reaction);
        reaction.participant = message.participant;
        reaction.message = message;
        this.eventEmitter.emit('message_reacted', reaction);
        return reaction;
    }

    async deleteMessageReaction(username: string, messageId: string) {
        const reaction = await this.messageReactionRepository
            .createQueryBuilder('mr')
            .innerJoinAndSelect('mr.participant', 'mrp')
            .innerJoinAndSelect('mrp.conversation', 'mrpc')
            .where('mrp.user = :username', { username })
            .andWhere('mr.message_id = :messageId', { messageId })
            .getOne();

        if (!reaction) {
            throw new NotFoundException('Message reaction not found');
        }
        await this.messageReactionRepository.delete({
            participantId: reaction.participantId,
            messageId: reaction.messageId,
        });
        this.eventEmitter.emit('message_reaction_deleted', reaction);
        return reaction;
    }
}
