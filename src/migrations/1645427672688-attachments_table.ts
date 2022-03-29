import { MigrationInterface, QueryRunner } from 'typeorm';

export class attachmentsTable1645427672688 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE attachments (
                id BIGSERIAL PRIMARY KEY,
                attachment_path VARCHAR(256) NOT NULL,

                message_id BIGINT NOT NULL,
                FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE attachments`);
    }
}
