import { Controller, Get, Param, Query } from '@nestjs/common';

import { MessageService } from '@app/message';
import { PagingationDto } from '@interfaces/general';

import { ConversationService } from './conversation.service';

@Controller('conversations')
export class ConversationController {
    constructor(
        private readonly conversationService: ConversationService,
        private readonly messageService: MessageService,
    ) {}

    @Get('/:conversationId(\\d+)/messages')
    getConversationMessages(
        @Param('conversationId') conversationId: number,
        @Query() pagingationDto: PagingationDto,
    ): any {
        return this.messageService.findMessageBy({ conversationId }, pagingationDto);
    }
}
