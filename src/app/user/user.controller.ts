import { BadRequestException, Body, Controller, Get, Patch, Query } from '@nestjs/common';

import { Authorize } from '@guards';
import { AuthUser } from '@generals/param.decorator';
import { Conversation, User } from '@entities';

import { Token } from '../account';

import { UserService } from './user.service';
import { UpdateUserDto } from './user.dto';
import { ConversationService } from '@app/conversation';
import { PagingationDto } from '@generals/pagination.dto';

@Controller('/users')
export class UserController {
    constructor(
        private readonly userSerice: UserService,
        private readonly conversationService: ConversationService,
    ) {}

    @Get('/')
    async getUsers(
        @Query() pagination: PagingationDto,
        @Query('q') query?: string,
    ): Promise<Array<User>> {
        return this.userSerice.findUsers(pagination, query);
    }

    @Get('/me')
    @Authorize()
    async getInfo(@AuthUser() user: Token): Promise<User> {
        return this.userSerice.findUserByUsername(user.username);
    }

    @Get('/me/conversations')
    @Authorize()
    async getAuthorizedUserParticipants(@AuthUser() user: Token): Promise<Array<Conversation>> {
        return this.conversationService.findUserConversations(user.username);
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
