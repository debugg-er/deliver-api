import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';

import ormconfig from '@config/ormconfig';
import mailerconfig from '@config/mailerconfig';
import { AuthorizeGuard } from '@guards';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AccountModule } from './account';
import { UserModule } from './user';
import { EventModule } from './event';

@Module({
    imports: [
        TypeOrmModule.forRoot(ormconfig),
        MailerModule.forRoot(mailerconfig),
        AccountModule,
        UserModule,
        EventModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: AuthorizeGuard,
        },
    ],
})
export class AppModule {}
