import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import ormconfig from '../ormconfig';
import { AuthModule } from './auth';

@Module({
    imports: [TypeOrmModule.forRoot(ormconfig), AuthModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
