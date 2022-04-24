import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTypeToMessages1650548247419 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE messages
            ADD COLUMN type VARCHAR(16)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE messages DROP COLUMN type`);
    }
}
