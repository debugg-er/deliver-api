import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
    async handleFileUpload(files: Array<Express.Multer.File>) {
        files.forEach((file) => {
            setTimeout(
                () => fs.rm(file.path, (err) => (err ? console.log(err) : undefined)),
                10 * 1000,
            );
        });

        return files.map((file) => {
            // eslint-disable-next-line
            const { fieldname, path, destination, filename, ...data } = file;
            Object.assign(data, { id: filename });
            return data;
        });
    }
}
