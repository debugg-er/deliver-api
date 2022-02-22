import { MigrationInterface, QueryRunner } from 'typeorm';

export class contactsTable1645430382494 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE contacts (
                user_1 VARCHAR(32) NOT NULL,
                user_2 VARCHAR(32) NOT NULL,
                status VARCHAR(16) NOT NULL,

                PRIMARY KEY (user_1, user_2),
                FOREIGN KEY (user_1) REFERENCES users(username),
                FOREIGN KEY (user_2) REFERENCES users(username)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE contacts`);
    }
}