import * as path from 'path';
import { ConnectionOptions } from 'typeorm';
import env from './environments';

export default {
    type: 'postgres',
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    username: env.POSTGRES_USERNAME,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_NAME,
    synchronize: false,
    logging: ['query'],
    entities: [path.join(__dirname, './entities/*{.ts,.js}')],
    migrations: [path.join(__dirname, './migrations/*{.ts,.js}')],
    cli: {
        migrationsDir: path.join(__dirname, './migrations'),
        entitiesDir: path.join(__dirname, './entities'),
    },
} as ConnectionOptions;
