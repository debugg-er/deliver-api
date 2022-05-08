import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Contact, Conversation, Message, Participant, User } from '@entities';
import { ConversationModule } from '@app/conversation';

import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Conversation, Participant, Message, Contact]),
        ConversationModule,
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
