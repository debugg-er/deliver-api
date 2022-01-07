import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { User } from '@entities/User';
import environments from '@environments';

@Injectable()
export class AuthService {
    public sendVerificationMail(user: User) {}

    public createJWT(user: User): string {
        return jwt.sign(
            {
                username: user.username,
            },
            environments.JWT_SECRET,
        );
    }
}
