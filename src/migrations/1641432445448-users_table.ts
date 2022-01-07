import { MigrationInterface, QueryRunner } from 'typeorm';

export class usersTable1641432445448 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE users (
                username VARCHAR(32) PRIMARY KEY,
                password VARCHAR(144) NOT NULL,
                first_name VARCHAR(64),
                last_name VARCHAR(64) NOT NULL,
                email VARCHAR(320) NOT NULL,
                is_verified BOOLEAN NOT NULL DEFAULT FALSE,
                avatar_path VARCHAR(128),
                joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE users`);
    }
}
