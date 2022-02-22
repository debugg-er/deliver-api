import { MigrationInterface, QueryRunner } from 'typeorm';

export class blockListTable1645430653526 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE block_lists (
                user_1 VARCHAR(32) NOT NULL,
                user_2 VARCHAR(32) NOT NULL,
                blocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                PRIMARY KEY (user_1, user_2),
                FOREIGN KEY (user_1) REFERENCES users(username),
                FOREIGN KEY (user_2) REFERENCES users(username)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE block_lists`);
    }
}