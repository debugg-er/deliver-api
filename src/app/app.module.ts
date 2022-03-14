import { APP_GUARD, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';

import ormconfig from '@config/ormconfig';
import mailerconfig from '@config/mailerconfig';
import { AuthorizeGuard } from '@guards';
import { ErrorsInterceptor } from '@interceptors';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AccountModule } from './account';
import { FileModule } from './file';
import { UserModule } from './user';
import { EventModule } from './event';
import { MessageModule } from './message';
import { ConversationModule } from './conversation';

@Module({
    imports: [
        TypeOrmModule.forRoot(ormconfig),
        MailerModule.forRoot(mailerconfig),
        AccountModule,
        UserModule,
        EventModule,
        FileModule,
        MessageModule,
        ConversationModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({ transform: true, whitelist: true }),
        },
        {
            provide: APP_GUARD,
            useClass: AuthorizeGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ErrorsInterceptor,
        },
    ],
})
export class AppModule {}
