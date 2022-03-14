"use strict";
exports.__esModule = true;
var path = require("path");
var environments_1 = require("../environments");
exports["default"] = {
    type: 'postgres',
    host: environments_1["default"].POSTGRES_HOST,
    port: environments_1["default"].POSTGRES_PORT,
    username: environments_1["default"].POSTGRES_USERNAME,
    password: environments_1["default"].POSTGRES_PASSWORD,
    database: environments_1["default"].POSTGRES_NAME,
    synchronize: false,
    logging: ['query'],
    entities: [path.join(__dirname, '../entities/*{.ts,.js}')],
    migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
    cli: {
        migrationsDir: path.join(__dirname, '../migrations'),
        entitiesDir: path.join(__dirname, '../entities')
    }
};
