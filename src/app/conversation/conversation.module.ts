import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

import { Conversation, Message } from '@entities';
import { MessageService } from '@app/message';

@Module({
    imports: [TypeOrmModule.forFeature([Conversation, Message])],
    providers: [ConversationService, MessageService],
    controllers: [ConversationController],
    exports: [ConversationService],
})
export class ConversationModule {}
