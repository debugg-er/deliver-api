import { BadRequestException, Body, Controller, Get, Patch, Query } from '@nestjs/common';

import { Authorize } from '@guards';
import { AuthUser } from '@generals/param.decorator';
import { Conversation, User } from '@entities';

import { Token } from '../account';

import { UserService } from './user.service';
import { UpdateUserDto } from './user.dto';
import { ConversationService, FindConversationDto } from '@app/conversation';
import { PagingationDto } from '@generals/pagination.dto';

@Controller('/users')
export class UserController {
    constructor(
        private readonly userSerice: UserService,
        private readonly conversationService: ConversationService,
    ) {}

    @Get('/')
    @Authorize()
    async getUsers(
        @AuthUser() user: Token,
        @Query() pagination: PagingationDto,
        @Query('q') query?: string,
    ): Promise<Array<User>> {
        return this.userSerice.findUsers(user.username, pagination, query);
    }

    @Get('/me')
    @Authorize()
    async getInfo(@AuthUser() user: Token): Promise<User> {
        return this.userSerice.findMe(user.username);
    }

    @Get('/me/may_knowns')
    @Authorize()
    async getMayKnowns(
        @AuthUser() user: Token,
        @Query() pagination: PagingationDto,
    ): Promise<User> {
        return this.userSerice.findYouMayKnowns(user.username, pagination);
    }

    @Get('/me/conversations')
    @Authorize()
    async getAuthorizedUserParticipants(
        @AuthUser() user: Token,
        @Query() dto: FindConversationDto,
    ): Promise<Array<Conversation>> {
        return this.conversationService.findUserConversations(user.username, dto);
    }

    @Patch('/me')
    @Authorize()
    async updateUser(@AuthUser() user: Token, @Body() dto: UpdateUserDto): Promise<User> {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('Update user require at least 1 data field');
        }
        const { avatar, ...rest } = dto;
        return this.userSerice.updateUser(user.username, rest, avatar);
    }
}
