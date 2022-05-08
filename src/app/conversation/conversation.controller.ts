import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';

import { Authorize } from '@guards';
import { PagingationDto } from '@generals/pagination.dto';

import { ConversationService } from './conversation.service';
import { AuthUser } from '@generals/param.decorator';
import { Token } from '@app/account';
import { CreateConversationDto, UpdateConversationDto } from './conversation.dto';

@Controller('conversations')
export class ConversationController {
    constructor(private readonly conversationService: ConversationService) {}

    @Get('/:conversationId(\\d{0,10})')
    @Authorize()
    getConversation(@AuthUser() user: Token, @Param('conversationId') conversationId: number) {
        return this.conversationService.findConversationById(user.username, conversationId);
    }

    @Get('/:conversationId(\\d{0,10})/attachments')
    @Authorize()
    getConversationAttachments(
        @AuthUser() user: Token,
        @Param('conversationId') conversationId: number,
        @Query() pagination: PagingationDto,
    ) {
        return this.conversationService.findConversationMedia(
            user.username,
            conversationId,
            pagination,
        );
    }

    @Get('/:username')
    @Authorize()
    getConversationByUsername(@AuthUser() user: Token, @Param('username') username: string) {
        return this.conversationService.findConversationByUsername(user.username, username);
    }

    @Get('/:conversationId(\\d+)/messages')
    @Authorize()
    getConversationMessages(
        @AuthUser() user: Token,
        @Param('conversationId') conversationId: number,
        @Query() pagingationDto: PagingationDto,
    ): any {
        return this.conversationService.findConversationMessagesAndUpdateParticipantStatus(
            user.username,
            conversationId,
            pagingationDto,
        );
    }

    @Get('/:conversationId(\\d+)/participants')
    @Authorize()
    getConversationParticipants(
        @AuthUser() user: Token,
        @Param('conversationId') conversationId: number,
        @Query() pagingationDto: PagingationDto,
    ): any {
        return this.conversationService.findConversationParticipants(
            user.username,
            conversationId,
            pagingationDto,
        );
    }

    @Post('/')
    @Authorize()
    createConversation(@AuthUser() user: Token, @Body() dto: CreateConversationDto) {
        if (dto.type === 'personal' && dto.participantUsernames.length > 1) {
            throw new BadRequestException(
                "participantUsernames must have only 1 element if type is set to 'personal'",
            );
        }
        return this.conversationService.createConveration(user.username, dto);
    }

    @Patch('/:conversationId(\\d+)')
    @Authorize()
    updateConversation(
        @AuthUser() user: Token,
        @Body() dto: UpdateConversationDto,
        @Param('conversationId') conversationId: number,
    ) {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('Update user require at least 1 data field');
        }
        return this.conversationService.updateConversation(user.username, conversationId, dto);
    }

    @Patch('/:conversationId(\\d+)/leave')
    @Authorize()
    leaveConversation(@AuthUser() user: Token, @Param('conversationId') conversationId: number) {
        return this.conversationService.leaveConversation(user.username, conversationId);
    }
}
