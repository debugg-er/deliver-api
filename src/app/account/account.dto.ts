import { IsNotEmpty } from 'class-validator';

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

    oldPassword?: string;
}
