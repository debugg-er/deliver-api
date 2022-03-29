import { BadRequestException, Body, Controller, Param, Patch, Post } from '@nestjs/common';

import { AuthUser } from '@generals/param.decorator';
import { Authorize } from '@guards';
import { Token } from '@app/account';

import { MessageService } from './message.service';
import { UpdateMessageDto } from './message.dto';

@Controller('messages')
export class MessageController {
    constructor(private messageService: MessageService) {}

    @Patch('/:messageId(\\d+)')
    @Authorize()
    patchMessage(
        @AuthUser() user: Token,
        @Param('messageId') messageId: string,
        @Body() dto: UpdateMessageDto,
    ): any {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('Update message require at least 1 data field');
        }
        return this.messageService.updateMessage(user.username, messageId, dto);
    }

    @Post('/:messageId(\\d+)/reactions')
    @Authorize()
    reactMessage(
        @AuthUser() user: Token,
        @Param('messageId') messageId: string,
        @Body('emoji') emoji: string,
    ): any {
        if (!emoji) {
            throw new BadRequestException('Emoji is required');
        }
        return this.messageService.reactMessage(user.username, messageId, emoji);
    }
}
