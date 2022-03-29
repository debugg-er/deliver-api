import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMessageDto {
    // @IsOptional()
    // @IsString()
    // content: string;

    @IsOptional()
    @IsBoolean()
    revoked: boolean;
}
