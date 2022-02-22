import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import environments from '@environments';
import { ErrorsInterceptor } from '@interceptors';

import { AppModule } from '@app/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });

    app.useGlobalInterceptors(new ErrorsInterceptor());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.listen(environments.PORT);
}
bootstrap();
