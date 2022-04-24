import { IsOptional } from 'class-validator';

export class UpdateParticipantDto {
    @IsOptional()
    nickname: string;
}
