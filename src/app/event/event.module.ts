import { Module } from '@nestjs/common';

import { EventGateway } from './event.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Message, Participant, User } from '@entities';

@Module({
    imports: [TypeOrmModule.forFeature([Conversation, User, Participant, Message])],
    providers: [EventGateway],
    exports: [EventGateway],
})
export class EventModule {}
