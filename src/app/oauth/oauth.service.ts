import * as request from 'request-promise';
import { BadRequestException, Injectable } from '@nestjs/common';

import env from '@environments';
import { StatusCodeError } from 'request-promise/errors';

interface GoogleProfile {
    azp: string;
    aud: string;
    sub: string;
    scope: string;
    exp: string;
    expires_in: string;
    email: string;
    email_verified: string;
    access_type: string;
    iss: string;
    at_hash: string;
    name: string;
    picture: string;
    given_name: string;
    family_name?: string;
    locale: string;
    iat: string;
    alg: string;
    kid: string;
    typ: string;
}

@Injectable()
export class OAuthService {
    public async oAuthGoogle(code: string): Promise<GoogleProfile> {
        try {
            const { id_token } = await request({
                method: 'POST',
                uri: 'https://oauth2.googleapis.com/token',
                body: {
                    code: code,
                    client_id: env.GOOGLE_CLIENT_ID,
                    client_secret: env.GOOGLE_CLIENT_SECRET,
                    redirect_uri: env.GOOGLE_REDIRECT_URI,
                    grant_type: 'authorization_code',
                },
                json: true,
            });

            const profile = await request({
                uri: 'https://oauth2.googleapis.com/tokeninfo',
                qs: { id_token },
                json: true,
            });

            return profile;
        } catch (err) {
            if (err instanceof StatusCodeError) {
                throw new BadRequestException('fail to get google data');
            }
            throw err;
        }
    }
}
