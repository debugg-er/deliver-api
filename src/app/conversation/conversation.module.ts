import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventModule } from '@app/event';

import { Conversation, Message, Participant } from '@entities';

import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
    imports: [TypeOrmModule.forFeature([Conversation, Message, Participant]), EventModule],
    providers: [ConversationService],
    controllers: [ConversationController],
    exports: [ConversationService],
})
export class ConversationModule {}
