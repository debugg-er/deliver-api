import { IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    password: string;
}

export class ForgotPasswordDto {
    @IsNotEmpty()
    username: string;
}

export class ResetPasswordDto {
    @IsNotEmpty()
    password: string;

    @IsOptional()
    oldPassword: string;
}
