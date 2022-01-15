import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { plainToInstance } from 'class-transformer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { User } from '@entities';
import environments from '@environments';
import randomstring from '@utils/randomstring';

import { CreateUserDto, UpdateUserDto, UserService } from '../user';
import { OAuthService } from '../oauth';

@Injectable()
export class AccountService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly userService: UserService,
        private readonly oAuthService: OAuthService,
    ) {}

    public async loginWithGoogle(code: string): Promise<string> {
        const googleProfile = await this.oAuthService.oAuthGoogle(code);
        const dto = plainToInstance(CreateUserDto, {
            username: googleProfile.sub,
            password: randomstring(16),
            email: googleProfile.email,
            firstName: googleProfile.family_name,
            lastName: googleProfile.given_name,
        });

        let user;
        try {
            user = await this.userService.findUserByUsername(dto.username);
        } catch {
            user = await this.userService.createUser(dto);
        }
        return this.createJWT(user);
    }

    public async register(dto: CreateUserDto): Promise<string> {
        const user = await this.userService.createUser(dto);
        return this.createJWT(user);
    }

    public async login(username: string, password: string): Promise<string> {
        const user = await this.userService.findUserByUsername(username);
        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) {
            throw new BadRequestException("password doesn't match");
        }
        return this.createJWT(user);
    }

    public async forgotPassword(username: string): Promise<void> {
        const user = await this.userService.findUserByUsername(username);
        await this.sendForgotPasswordMail(user);
    }

    public async resetPassword(username: string, newPassword: string): Promise<User> {
        const updateUserDto = plainToInstance(UpdateUserDto, { password: newPassword });
        return await this.userService.updateUser(username, updateUserDto);
    }

    async sendForgotPasswordMail(user: User): Promise<void> {
        const token = jwt.sign(
            {
                type: 'Verifier',
                username: user.username,
                email: user.email,
            },
            environments.JWT_SECRET,
        );
        await this.mailerService.sendMail({
            from: environments.MAIL,
            to: user.email,
            subject: '[Deliver] Reset your account password',
            text: `click here to reset your password: ${environments.FRONTEND_URL}/reset?token=${token}`,
        });
    }

    createJWT(user: User): string {
        return jwt.sign(
            {
                type: 'Bearer',
                username: user.username,
            },
            environments.JWT_SECRET,
        );
    }
}
