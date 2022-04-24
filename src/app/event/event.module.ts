import { Module } from '@nestjs/common';

import { EventGateway } from './event.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Message, Participant, User } from '@entities';
import { MessageModule } from '@app/message';
import { ConversationModule } from '@app/conversation';

@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, User, Participant, Message]),
        MessageModule,
        ConversationModule,
    ],
    providers: [EventGateway],
    exports: [EventGateway],
})
export class EventModule {}
