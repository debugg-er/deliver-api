import { MigrationInterface, QueryRunner } from 'typeorm';

export class deletedConversationsTable1645431652924 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE deleted_conversations (
                "user" VARCHAR(32) NOT NULL,
                conversation_id INT NOT NULL,

                PRIMARY KEY ("user", conversation_id),
                FOREIGN KEY ("user") REFERENCES users(username) ON DELETE CASCADE,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE deleted_conversations`);
    }
}
