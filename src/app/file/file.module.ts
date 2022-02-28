import * as fs from 'fs';
import * as crypto from 'crypto';
import * as multer from 'multer';
import * as mimeType from 'mime-types';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import environment from '@environments';

import { FileController } from './file.controller';
import { FileService } from './file.service';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Message, Participant, User } from '@entities';
import { Repository } from 'typeorm';

@Module({
    imports: [
        TypeOrmModule.forFeature([Message, Participant, User, Conversation]),
        MulterModule.register({
            limits: { fileSize: 20 * 1024 * 1024 },
            storage: multer.diskStorage({
                destination: environment.TEMP_FOLDER_PATH,
                filename: (req, file, cb) => {
                    const rand = crypto.randomBytes(16).toString('hex');
                    const extension = mimeType.extension(file.mimetype);
                    cb(null, rand + '.' + extension);
                },
            }),
        }),
    ],
    controllers: [FileController],
    providers: [FileService],
})
export class FileModule {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        @InjectRepository(Participant)
        private readonly participantRepository: Repository<Participant>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Conversation)
        private readonly cr: Repository<Conversation>,
    ) {
        if (!fs.existsSync(environment.TEMP_FOLDER_PATH)) {
            fs.mkdirSync(environment.TEMP_FOLDER_PATH);
        }
    }
}
