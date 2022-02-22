import * as jwt from 'jsonwebtoken';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    SetMetadata,
} from '@nestjs/common';

import environments from '@environments';
import { Token } from '../app/account';

@Injectable()
export class AuthorizeGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const metadata = this.reflector.get('authorize', context.getHandler());
        if (!metadata) return true;

        const req = context.switchToHttp().getRequest();
        const authorization = req.headers.authorization;

        if (!authorization && metadata.require) {
            throw new UnauthorizedException('Not authorized');
        } else {
            return true;
        }

        try {
            // prettier-ignore
            const [/* type */, token] = authorization.split(' ');
            const decoded = jwt.verify(token, environments.JWT_SECRET) as Token;

            if (!req.local) {
                req.local = {};
            }
            req.local.auth = decoded;
            return true;
        } catch {
            if (metadata.require) {
                throw new UnauthorizedException('Not authorized');
            }
            return true;
        }
    }
}

export const Authorize = (option?: { require: boolean }) =>
    SetMetadata('authorize', option || { require: true });
