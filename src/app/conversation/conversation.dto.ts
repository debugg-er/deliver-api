import { ArrayMinSize, IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PagingationDto } from '@generals/pagination.dto';
import { Participant } from '@entities';

export class CreateConversationDto {
    @IsNotEmpty()
    @IsIn(['group', 'personal'])
    type: 'group' | 'personal';

    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    participantUsernames: Array<string>;
}

export class FindConversationDto extends PagingationDto {
    @IsOptional()
    @IsString()
    @IsIn(['group', 'stranger', 'friend'])
    type?: 'friend' | 'stranger' | 'group';
}

export class UpdateConversationDto {
    @IsOptional()
    @IsString()
    title: string;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    addParticipantUsernames: Array<string>;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    removeParticipants: Array<Participant['id']>;
}
