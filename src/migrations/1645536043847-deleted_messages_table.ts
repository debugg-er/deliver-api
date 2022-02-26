import { MigrationInterface, QueryRunner } from 'typeorm';

export class deletedMessagesTable1645536043847 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE deleted_messages (
                "user" VARCHAR(32) NOT NULL,
                message_id INT NOT NULL,

                PRIMARY KEY ("user", message_id),
                FOREIGN KEY ("user") REFERENCES users(username),
                FOREIGN KEY (message_id) REFERENCES messages(id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE deleted_messages`);
    }
}
