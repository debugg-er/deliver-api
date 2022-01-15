import * as path from 'path';
import { ConnectionOptions } from 'typeorm';
import environments from '../environments';

export default <ConnectionOptions>{
    type: 'postgres',
    host: environments.POSTGRES_HOST,
    port: environments.POSTGRES_PORT,
    username: environments.POSTGRES_USERNAME,
    password: environments.POSTGRES_PASSWORD,
    database: environments.POSTGRES_NAME,
    synchronize: false,
    logging: ['query'],
    entities: [path.join(__dirname, '../entities/*{.ts,.js}')],
    migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
    cli: {
        migrationsDir: path.join(__dirname, '../migrations'),
        entitiesDir: path.join(__dirname, '../entities'),
    },
};
