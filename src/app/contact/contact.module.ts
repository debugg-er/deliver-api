import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Contact, User } from '@entities';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Contact])],
    controllers: [ContactController],
    providers: [ContactService],
    exports: [ContactService],
})
export class ContactModule {}
