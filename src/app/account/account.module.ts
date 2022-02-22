import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@entities';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';

import { OAuthService } from '@app/oauth';
import { UserService } from '@app/user';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [AccountController],
    providers: [AccountService, OAuthService, UserService],
})
export class AccountModule {}
