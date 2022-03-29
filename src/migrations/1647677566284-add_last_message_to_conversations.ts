import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLastMessageToConversations1647677566284 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE conversations
            ADD COLUMN last_message_id BIGINT REFERENCES messages(id)
        `);

        await queryRunner.query(`
            UPDATE conversations SET last_message_id = (
                WITH conversation_messages(id, created_at) AS (
                    SELECT messages.id, created_at FROM messages
                    JOIN participants ON participants.id = participant_id
                    WHERE conversation_id = conversations.id
                )
                SELECT id FROM conversation_messages
                WHERE created_at = (SELECT MAX(created_at) FROM conversation_messages)
                limit 1
            );
        `);

        await queryRunner.query(`
            CREATE FUNCTION fn_update_last_message()
            RETURNS TRIGGER LANGUAGE PLPGSQL
            AS
            $$
            BEGIN
                UPDATE conversations SET last_message_id = NEW.id
                WHERE id = (
                    SELECT conversation_id
                    FROM participants
                    WHERE id = NEW.participant_id
                );
                RETURN NEW;
            END;
            $$
        `);

        await queryRunner.query(`
            CREATE TRIGGER update_last_message
            AFTER INSERT ON messages
            FOR EACH ROW
            EXECUTE PROCEDURE fn_update_last_message();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER update_last_message ON messages`);
        await queryRunner.query(`DROP FUNCTION fn_update_last_message`);
        await queryRunner.query(`ALTER TABLE conversations DROP COLUMN last_message_id`);
    }
}
