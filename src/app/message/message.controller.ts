import { Controller, Get } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
    constructor(private messageService: MessageService) {}

    @Get('/')
    getMessages(): string {
        return 'hello world';
    }
}
