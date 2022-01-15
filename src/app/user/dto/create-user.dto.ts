import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(32)
    readonly username: string;

    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(32)
    readonly password: string;

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    readonly firstName?: string;

    @IsNotEmpty()
    readonly lastName: string;
}
