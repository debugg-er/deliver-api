import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { Attachment } from '@entities';

@Injectable()
export class AttachmentService {
    constructor(
        @InjectRepository(Attachment)
        private readonly attachmentRepository: Repository<Attachment>,
    ) {}

    async findSurroundAttachments(username: string, attachmentId: number) {
        const attachment = await this.attachmentRepository.findOne(attachmentId, {
            relations: [
                'message',
                'message.participant',
                'message.participant.conversation',
                'message.participant.conversation.participants',
                'message.participant.conversation.participants.user',
            ],
        });

        if (!attachment) {
            throw new NotFoundException('Attachment not found');
        }
        if (
            attachment.message.participant.conversation.participants.every(
                (p) => p.user.username !== username,
            )
        ) {
            throw new UnauthorizedException('You are not in this conversation');
        }

        const attachmentsRight = await this.attachmentRepository
            .createQueryBuilder('a')
            .innerJoin('a.message', 'm')
            .innerJoin('m.participant', 'p')
            .where('p.conversation_id = :conversationId', {
                conversationId: attachment.message.participant.conversation.id,
            })
            .andWhere('a.id <= :attachmentId', { attachmentId })
            .andWhere('m.revokedAt IS NULL')
            .take(10)
            .orderBy('a.id', 'DESC')
            .getMany();

        const attachmentsLeft = await this.attachmentRepository
            .createQueryBuilder('a')
            .innerJoin('a.message', 'm')
            .innerJoin('m.participant', 'p')
            .where('p.conversation_id = :conversationId', {
                conversationId: attachment.message.participant.conversation.id,
            })
            .andWhere('a.id > :attachmentId', { attachmentId })
            .andWhere('m.revokedAt IS NULL')
            .take(9)
            .orderBy('a.id', 'ASC')
            .getMany();

        return [...attachmentsLeft.reverse(), ...attachmentsRight];
    }
}
