import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/entities/User';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { OAuthService } from '../oauth';
import { UserService } from '../user/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [AuthController],
    providers: [AuthService, OAuthService, UserService],
})
export class AuthModule {}
