// import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app';
import { ErrorsInterceptor } from './interceptors/errors.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalInterceptors(new ErrorsInterceptor());
    // app.useGlobalPipes(
    //     new ValidationPipe({
    //         transform: true,
    //         stopAtFirstError: true,
    //     }),
    // );
    await app.listen(3000);
}
bootstrap();
