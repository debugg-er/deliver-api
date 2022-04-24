import { Controller, Get, Param } from '@nestjs/common';

import { Token } from '@app/account';
import { AuthUser } from '@generals/param.decorator';
import { Authorize } from '@guards';

import { AttachmentService } from './attachment.service';

@Controller('attachments')
export class AttachmentController {
    constructor(private attachmentService: AttachmentService) {}

    @Get('/:attachmentId(\\d+)')
    @Authorize()
    getSurroundAttachments(@AuthUser() user: Token, @Param('attachmentId') attachmentId: number) {
        return this.attachmentService.findSurroundAttachments(user.username, attachmentId);
    }
}
