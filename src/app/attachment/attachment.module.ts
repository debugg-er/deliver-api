import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Attachment } from '@entities';

import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';

@Module({
    imports: [TypeOrmModule.forFeature([Attachment])],
    providers: [AttachmentService],
    controllers: [AttachmentController],
    exports: [AttachmentService],
})
export class AttachmentModule {}
