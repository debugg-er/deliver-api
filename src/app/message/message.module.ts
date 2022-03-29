import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessageController } from './message.controller';
import { MessageService } from './message.service';

import { Message, MessageReaction, Participant } from '@entities';

@Module({
    imports: [TypeOrmModule.forFeature([Message, Participant, MessageReaction])],
    providers: [MessageService],
    controllers: [MessageController],
    exports: [MessageService],
})
export class MessageModule {}
