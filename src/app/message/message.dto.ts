import {
    ArrayMinSize,
    IsArray,
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';

export class CreateMessageDto {
    @IsOptional()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsInt()
    conversationId: number;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    attachments?: Array<string>;
}

export class UpdateMessageDto {
    // @IsOptional()
    // @IsString()
    // content: string;

    @IsOptional()
    @IsBoolean()
    revoked: boolean;
}

export class ReactMessageDto {
    @IsNotEmpty()
    @Matches(/^\p{Extended_Pictographic}$/u)
    emoji: string;
}
