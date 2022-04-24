import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTypeToAttachments1648805459716 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE attachments
            ADD COLUMN type VARCHAR(16) NOT NULL DEFAULT 'file'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE attachments DROP COLUMN type`);
    }
}
