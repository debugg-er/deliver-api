import { Controller, Get } from '@nestjs/common';
import { ParticipantService } from './participant.service';

@Controller('participants')
export class ParticipantController {
    constructor(private participantService: ParticipantService) {}

    @Get('/')
    getParticipants(): string {
        return 'hello world';
    }
}
