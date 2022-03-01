import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

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

    @IsOptional()
    readonly firstName?: string;

    @IsNotEmpty()
    readonly lastName: string;

    @IsNotEmpty()
    readonly female: boolean;
}

export class UpdateUserDto {
    @IsOptional()
    readonly email: string;

    @IsOptional()
    readonly firstName: string;

    @IsOptional()
    readonly lastName: string;

    @IsOptional()
    readonly avatar: string;

    @IsOptional()
    readonly female: boolean;
}
