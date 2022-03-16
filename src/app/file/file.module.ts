import * as fs from 'fs';
import * as crypto from 'crypto';
import * as multer from 'multer';
import * as mimeType from 'mime-types';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';

import environment from '@environments';

import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
    imports: [
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
        ServeStaticModule.forRoot({
            rootPath: environment.PUBLIC_FOLDER_PATH,
            serveRoot: '/public',
        }),
    ],
    controllers: [FileController],
    providers: [FileService],
})
export class FileModule {
    constructor() {
        if (!fs.existsSync(environment.TEMP_FOLDER_PATH)) {
            fs.mkdirSync(environment.TEMP_FOLDER_PATH);
        }
        if (!fs.existsSync(environment.PUBLIC_FOLDER_PATH)) {
            fs.mkdirSync(environment.PUBLIC_FOLDER_PATH);
        }
    }
}
