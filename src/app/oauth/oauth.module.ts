import { Logger, Module } from '@nestjs/common';
import { OAuthService } from './oauth.service';

@Module({
    providers: [OAuthService],
    exports: [OAuthService, Logger],
})
export class OAuthModule {}
