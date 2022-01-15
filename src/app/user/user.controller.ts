import { Controller, Get } from '@nestjs/common';

import { Authorize } from '@guards';
import { AuthUser } from '@decorators';
import { User } from '@entities';
import { Token } from '../account';

import { UserService } from './user.service';

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
}
