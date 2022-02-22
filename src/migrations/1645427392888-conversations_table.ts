import { MigrationInterface, QueryRunner } from 'typeorm';

export class conversationsTable1645427392888 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE conversations (
                id SERIAL PRIMARY KEY,
                title VARCHAR(256) NOT NULL,
                type VARCHAR(16),
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE conversations`);
    }
}
