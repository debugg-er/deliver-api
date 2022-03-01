import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import environment from '@environments';
import { Conversation, User } from '@entities';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';

import { OAuthService } from '@app/oauth';
import { UserService } from '@app/user';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Conversation]),
        JwtModule.register({ secret: environment.JWT_SECRET }),
    ],
    controllers: [AccountController],
    providers: [AccountService, OAuthService, UserService],
})
export class AccountModule {}
