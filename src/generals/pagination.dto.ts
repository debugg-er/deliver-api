import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class PagingationDto {
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(0)
    offset = 0;

    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(0)
    @Max(100)
    limit = 30;
}
