import { BadRequestException, Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';

import { AuthUser } from '@generals/param.decorator';
import { Authorize } from '@guards';
import { Token } from '@app/account';

import { MessageService } from './message.service';
import { CreateMessageDto, ReactMessageDto, UpdateMessageDto } from './message.dto';

@Controller('messages')
export class MessageController {
    constructor(private messageService: MessageService) {}

    @Post('/')
    @Authorize()
    postMessage(
        @AuthUser() user: Token,
        @Param('messageId') messageId: string,
        @Body() dto: CreateMessageDto,
    ): any {
        if (!dto.content && !dto.attachments) {
            throw new BadRequestException('content must not be empty');
        }
        return this.messageService.createMessage(user.username, dto);
    }

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
        @Body() dto: ReactMessageDto,
    ): any {
        return this.messageService.reactMessage(user.username, messageId, dto);
    }

    @Delete('/:messageId(\\d+)/reactions')
    @Authorize()
    deleteMessageReaction(@AuthUser() user: Token, @Param('messageId') messageId: string): any {
        return this.messageService.deleteMessageReaction(user.username, messageId);
    }
}
