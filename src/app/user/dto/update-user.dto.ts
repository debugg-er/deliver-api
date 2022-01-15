import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
    @IsNotEmpty()
    readonly password: string;

    @IsNotEmpty()
    readonly email: string;

    @IsNotEmpty()
    readonly firstName: string;

    @IsNotEmpty()
    readonly lastName: string;

    @IsNotEmpty()
    readonly avatar: string;
}
