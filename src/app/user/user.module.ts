import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Conversation, Participant, User } from '@entities';
import { ConversationService } from '@app/conversation';

import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User, Conversation, Participant])],
    controllers: [UserController],
    providers: [UserService, ConversationService],
    exports: [UserService],
})
export class UserModule {}
