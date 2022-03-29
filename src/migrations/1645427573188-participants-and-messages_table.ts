import { MigrationInterface, QueryRunner } from 'typeorm';

export class participantsTable1645427573188 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE participants (
                id SERIAL PRIMARY KEY,
                nickname VARCHAR(256),
                role VARCHAR(16),
                joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                removed_at TIMESTAMP,

                "user" VARCHAR(32) NOT NULL,
                seen_message_id BIGINT,
                delivered_message_id BIGINT,
                conversation_id INT NOT NULL,

                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
                FOREIGN KEY ("user") REFERENCES users(username) ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE messages (
                id BIGSERIAL PRIMARY KEY,
                content VARCHAR(8000) NOT NULL,
                revoked_at TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                parent_id BIGINT,
                participant_id INT NOT NULL,

                FOREIGN KEY (parent_id) REFERENCES messages(id) ON DELETE CASCADE,
                FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            ALTER TABLE participants ADD CONSTRAINT FK_ParticipantSeenMessage
            FOREIGN KEY (seen_message_id) REFERENCES messages(id) ON DELETE SET NULL
        `);
        await queryRunner.query(`
            ALTER TABLE participants ADD CONSTRAINT FK_ParticipantDeliveredMessage
            FOREIGN KEY (delivered_message_id) REFERENCES messages(id) ON DELETE SET NULL
        `);
        await queryRunner.query(`CREATE INDEX message_parent_id_idx ON messages(parent_id)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX message_parent_id_idx`);
        await queryRunner.query(
            `ALTER TABLE participants DROP CONSTRAINT FK_ParticipantSeenMessage`,
        );
        await queryRunner.query(
            `ALTER TABLE participants DROP CONSTRAINT FK_ParticipantDeliveredMessage`,
        );

        await queryRunner.query(`DROP TABLE messages`);
        await queryRunner.query(`DROP TABLE participants`);
    }
}
