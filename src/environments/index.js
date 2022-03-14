"use strict";
exports.__esModule = true;
var path = require("path");
var dotenv = require("dotenv");
dotenv.config();
// prettier-ignore
var env = {
    PORT: parseInt(process.env.PORT || '') || 8080,
    POSTGRES_PORT: parseInt(process.env.DB_PORT || '') || 5432,
    POSTGRES_HOST: process.env.POSTGRES_HOST || '127.0.0.1',
    POSTGRES_USERNAME: process.env.POSTGRES_USERNAME || 'postgres',
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || null,
    POSTGRES_NAME: process.env.POSTGRES_NAME || 'test',
    JWT_SECRET: process.env.JWT_SECRET || 'secret',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://127.0.0.1:3000',
    BACKEND_URL: process.env.BACKEND_URL || 'http://127.0.0.1:3000',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    MAIL: process.env.MAIL,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    TEMP_FOLDER_PATH: path.join(__dirname, '../../tmp')
};
(function () {
    var missingVariables = Object.keys(env).filter(function (key) { return !env[key]; });
    if (missingVariables.length !== 0) {
        throw new Error('missing environment variable: ' + missingVariables);
    }
})();
exports["default"] = env;
