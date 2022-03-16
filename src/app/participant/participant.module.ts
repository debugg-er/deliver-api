import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ParticipantController } from './participant.controller';
import { ParticipantService } from './participant.service';

import { Participant } from '@entities';

@Module({
    imports: [TypeOrmModule.forFeature([Participant])],
    providers: [ParticipantService],
    controllers: [ParticipantController],
    exports: [ParticipantService],
})
export class ParticipantModule {}
