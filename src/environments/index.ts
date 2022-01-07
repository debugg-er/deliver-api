import * as dotenv from 'dotenv';

dotenv.config();

// prettier-ignore
export default {
    PORT:                   parseInt(process.env.PORT)              || 8080,
    POSTGRES_PORT:          parseInt(process.env.DB_PORT)           || 5432,
    POSTGRES_HOST:          process.env.POSTGRES_HOST               || "127.0.0.1",
    POSTGRES_USERNAME:      process.env.POSTGRES_USERNAME           || "postgres",
    POSTGRES_PASSWORD:      process.env.POSTGRES_PASSWORD           || null,
    POSTGRES_NAME:          process.env.POSTGRES_NAME               || "test",
    JWT_SECRET:             process.env.JWT_SECRET                  || 'secret',
    FRONTEND_URL:           process.env.FRONTEND_URL                || 'http://localhost:3000',

    GOOGLE_CLIENT_ID:       process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET:   process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI:    process.env.GOOGLE_REDIRECT_URI,
};
