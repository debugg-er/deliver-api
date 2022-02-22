import { MigrationInterface, QueryRunner } from 'typeorm';

export class messageReactions1645536181669 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE message_reactions (
                participant_id INT NOT NULL,
                message_id INT NOT NULL,
                emoji CHAR(1) NOT NULL,
                reacted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                PRIMARY KEY (participant_id, message_id),
                FOREIGN KEY (participant_id) REFERENCES participants(id),
                FOREIGN KEY (message_id) REFERENCES messages(id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE message_reactions`);
    }
}
