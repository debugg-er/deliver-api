import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Controller, Get, Query, Redirect } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from 'src/entities/User';
import environments from '@environments';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

import { OAuthService } from '../oauth';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private userService: UserService,
        private authService: AuthService,
        private oAuthService: OAuthService,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    @Get('/google')
    @Redirect()
    async loginWithGoogle(@Query('code') code: string): Promise<any> {
        const googleProfile = await this.oAuthService.oAuthGoogle(code);
        const createUserDto = plainToInstance(CreateUserDto, {
            username: googleProfile.sub,
            password: Math.random().toString(),
            email: googleProfile.email,
            firstName: googleProfile.family_name,
            lastName: googleProfile.given_name,
        });
        const user = await this.userService.createUser(createUserDto);
        const token = this.authService.createJWT(user);
        console.log(user);

        return {
            url: `${environments.FRONTEND_URL}?token=${token}`,
        };
    }
}
