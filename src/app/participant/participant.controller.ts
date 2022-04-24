import { BadRequestException, Body, Controller, Get, Param, Patch } from '@nestjs/common';

import { Token } from '@app/account';
import { AuthUser } from '@generals/param.decorator';
import { Authorize } from '@guards';

import { UpdateParticipantDto } from './participant.dto';
import { ParticipantService } from './participant.service';

@Controller('participants')
export class ParticipantController {
    constructor(private participantService: ParticipantService) {}

    @Get('/')
    getParticipants(): string {
        return 'hello world';
    }

    @Patch('/:participantId(\\d+)')
    @Authorize()
    patchParticipant(
        @AuthUser() user: Token,
        @Param('participantId') participantId: number,
        @Body() dto: UpdateParticipantDto,
    ) {
        if (Object.keys(dto).length === 0) {
            throw new BadRequestException('Update participant require at least 1 data field');
        }
        return this.participantService.updateParticipant(user.username, participantId, dto);
    }
}
