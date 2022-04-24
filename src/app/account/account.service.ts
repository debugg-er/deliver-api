import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';

import { User } from '@entities';
import environments from '@environments';
import randomstring from '@utils/randomstring';

import { CreateUserDto, UserService } from '../user';
import { OAuthService } from '../oauth';

@Injectable()
export class AccountService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly oAuthService: OAuthService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    public async loginWithGoogle(code: string): Promise<string> {
        const googleProfile = await this.oAuthService.oAuthGoogle(code);

        let user;
        try {
            user = await this.userService.findUserByUsername(googleProfile.sub);
        } catch {
            user = await this.userService.createUser({
                username: googleProfile.sub,
                password: randomstring(16),
                email: googleProfile.email,
                firstName: googleProfile.family_name,
                lastName: googleProfile.given_name,
                female: true,
            });
        }
        return this.createJWT(user);
    }

    public async register(dto: CreateUserDto): Promise<string> {
        const user = await this.userService.createUser(dto);
        return this.createJWT(user);
    }

    public async login(username: string, password: string): Promise<string> {
        const user = await this.userRepository
            .createQueryBuilder('users')
            .select(['users.username', 'users.password'])
            .where({ username })
            .getOne();
        if (!user) {
            throw new NotFoundException("Username doesn't exist");
        }

        const isMatch = await argon2.verify(user.password, password);
        if (!isMatch) {
            throw new BadRequestException("password doesn't match");
        }
        return this.createJWT(user);
    }

    public async forgotPassword(username: string): Promise<void> {
        const user = await this.userService.findUserByUsername(username);
        this.sendForgotPasswordMail(user);
    }

    public async resetPassword(username: string, newPassword: string): Promise<void> {
        this.userService.updateUser(username, { password: newPassword });
    }

    async sendForgotPasswordMail(user: User): Promise<void> {
        const token = this.jwtService.sign({
            type: 'Verifier',
            username: user.username,
            email: user.email,
        });
        await this.mailerService.sendMail({
            from: environments.MAIL,
            to: user.email,
            subject: '[Deliver] Reset your account password',
            text: `Click here to reset your password: ${environments.FRONTEND_URL}/auth/forgot?token=${token}`,
        });
    }

    createJWT(user: User): string {
        return this.jwtService.sign({
            type: 'Bearer',
            username: user.username,
        });
    }
}
