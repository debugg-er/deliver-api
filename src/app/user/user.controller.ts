import { BadRequestException, Body, Controller, Get, Patch } from '@nestjs/common';

import { Authorize } from '@guards';
import { AuthUser } from '@decorators';
import { User } from '@entities';
import { Token } from '../account';

import { UserService } from './user.service';
import { UpdateUserDto } from './user.dto';

@Controller('/users')
export class UserController {
    constructor(private userSerice: UserService) {}

    @Get('/')
    async getUsers(): Promise<Array<User>> {
        return this.userSerice.findAllUsers();
    }

    @Get('/me')
    @Authorize()
    async getInfo(@AuthUser() user: Token): Promise<User> {
        return this.userSerice.findUserByUsername(user.username);
    }

    @Patch('/me')
    @Authorize()
    async updateUser(@AuthUser() user: Token, @Body() dto: UpdateUserDto): Promise<User> {
        console.log(dto);
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('Update user require at least 1 data field');
        }
        return this.userSerice.updateUser(user.username, dto);
    }
}
