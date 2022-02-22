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

                FOREIGN KEY (conversation_id) REFERENCES conversations(id),
                FOREIGN KEY ("user") REFERENCES users(username)
            )
        `);

        await queryRunner.query(`
            CREATE TABLE messages (
                id BIGSERIAL PRIMARY KEY,
                content VARCHAR(256) NOT NULL,
                revoked_at TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                reply_of BIGINT,
                participant_id INT NOT NULL,

                FOREIGN KEY (reply_of) REFERENCES messages(id)
            )
        `);

        await queryRunner.query(`
            ALTER TABLE participants ADD CONSTRAINT FK_ParticipantSeenMessage
            FOREIGN KEY (seen_message_id) REFERENCES messages(id)
        `);
        await queryRunner.query(`
            ALTER TABLE participants ADD CONSTRAINT FK_ParticipantDeliveredMessage
            FOREIGN KEY (delivered_message_id) REFERENCES messages(id)
        `);
        await queryRunner.query(`
            ALTER TABLE messages ADD CONSTRAINT FK_MessageSentByParticipant
            FOREIGN KEY (participant_id) REFERENCES participants(id)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE messages DROP CONSTRAINT FK_MessageSentByParticipant`);
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
