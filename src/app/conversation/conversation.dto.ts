import { ArrayMinSize, IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PagingationDto } from '@generals/pagination.dto';

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
