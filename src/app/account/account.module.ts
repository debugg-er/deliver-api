import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/entities/User';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';

import { OAuthService } from '../oauth';
import { UserService } from '../user/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [AccountController],
    providers: [AccountService, OAuthService, UserService],
})
export class AccountModule {}
