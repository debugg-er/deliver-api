import { ArrayMinSize, IsArray, IsIn, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
    @IsNotEmpty()
    @IsIn(['group', 'personal'])
    readonly type: 'group' | 'personal';

    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    readonly participantUsernames: Array<string>;
}
