import { NestFactory } from '@nestjs/core';

import environments from '@environments';
import { AppModule } from '@app/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });

    await app.listen(environments.PORT);
}
bootstrap();
