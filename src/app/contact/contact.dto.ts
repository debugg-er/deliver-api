import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PagingationDto } from '@generals/pagination.dto';

export class FindContactDto extends PagingationDto {
    @IsNotEmpty()
    @IsString()
    @IsIn(['pending', 'sent', 'friend'])
    status: 'pending' | 'sent' | 'friend';

    @IsOptional()
    @IsString()
    query?: string;
}

export class ModifyContactDto {
    @IsNotEmpty()
    @IsString()
    @IsIn(['send_request', 'accept_request', 'remove_request', 'unfriend'])
    action: 'send_request' | 'accept_request' | 'remove_request' | 'unfriend';

    @IsNotEmpty()
    @IsString()
    target: string;
}
