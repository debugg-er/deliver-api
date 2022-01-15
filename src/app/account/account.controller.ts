import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Query,
    Redirect,
} from '@nestjs/common';

import environments from '@environments';
import { Authorize } from '@guards';
import { AuthUser } from '@decorators';

import { AccountService } from './account.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { Token } from './account.interface';

import { UserService, CreateUserDto } from '../user';
import { OAuthService } from '../oauth';

@Controller('account')
export class AccountController {
    constructor(
        private userService: UserService,
        private accountService: AccountService,
        private oAuthService: OAuthService,
    ) {}

    @Get('/google')
    @Redirect()
    async loginWithGoogle(@Query('code') code: string): Promise<any> {
        const token = await this.accountService.loginWithGoogle(code);
        return {
            url: `${environments.FRONTEND_URL}?token=${token}`,
        };
    }

    @Post('/register')
    async register(@Body() dto: CreateUserDto): Promise<any> {
        const token = await this.accountService.register(dto);
        return { token };
    }

    @Post('/login')
    async login(@Body() dto: LoginDto): Promise<any> {
        const token = await this.accountService.login(dto.username, dto.password);
        return { token };
    }

    @Post('/forgot')
    async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<any> {
        await this.accountService.forgotPassword(dto.username);
        return {
            message:
                'An email was sent to your email address, ' +
                'follow the link in that email to reset your password',
        };
    }

    @Patch('/reset')
    @Authorize()
    async resetPassword(@AuthUser() auth: Token, @Body() dto: ResetPasswordDto): Promise<any> {
        if (auth.type !== 'Verifier') {
            if (!dto.oldPassword) throw new BadRequestException('oldPassword should not be empty');
            await this.accountService.login(auth.username, dto.oldPassword);
        }
        const user = await this.accountService.resetPassword(auth.username, dto.password);
        return { user: user };
    }
}
