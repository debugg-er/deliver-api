import { IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(32)
    username: string;

    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(32)
    password: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    firstName?: string;

    @IsNotEmpty()
    lastName: string;

    @IsNotEmpty()
    female: boolean;
}

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    firstName: string;

    @IsOptional()
    lastName: string;

    @IsOptional()
    avatar: string;

    @IsOptional()
    female: boolean;
}
