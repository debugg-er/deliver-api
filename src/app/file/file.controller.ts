import {
    BadRequestException,
    Controller,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { FileService } from './file.service';

@Controller('/files')
export class FileController {
    constructor(private readonly fileService: FileService) {}
    @Post('/')
    @UseInterceptors(FilesInterceptor('files'))
    async postFile(@UploadedFiles() files: Array<Express.Multer.File>): Promise<any> {
        if (!files) {
            throw new BadRequestException('Missing files');
        }
        return this.fileService.handleFileUpload(files);
    }
}
