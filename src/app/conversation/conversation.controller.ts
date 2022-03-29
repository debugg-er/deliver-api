import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { Authorize } from '@guards';
import { PagingationDto } from '@generals/pagination.dto';

import { ConversationService } from './conversation.service';
import { AuthUser } from '@generals/param.decorator';
import { Token } from '@app/account';
import { CreateConversationDto } from './conversation.dto';

@Controller('conversations')
export class ConversationController {
    constructor(private readonly conversationService: ConversationService) {}

    @Get('/:conversationId(\\d{0,10})')
    @Authorize()
    getConversation(@AuthUser() user: Token, @Param('conversationId') conversationId: number) {
        return this.conversationService.findConversationById(user.username, conversationId);
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
}
