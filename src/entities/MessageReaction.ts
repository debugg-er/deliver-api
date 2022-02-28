import {
    Entity,
    Column,
    PrimaryColumn,
    BeforeInsert,
    BeforeUpdate,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Length, validateOrReject } from 'class-validator';
import { Message } from './Message';
import { Participant } from './Participant';

@Entity('message_reactions')
export class MessageReaction {
    @PrimaryColumn({ name: 'message_id', type: 'bigint' })
    messageId: number;

    @PrimaryColumn({ name: 'participant_id' })
    participantId: number;

    @Column({ type: 'text' })
    @Length(1, 1)
    emoji: string;

    @Column({ name: 'reacted_at', default: 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @ManyToOne(() => Message, (message) => message.reactions)
    @JoinColumn({ name: 'message_id', referencedColumnName: 'id' })
    message: Message;

    @ManyToOne(() => Participant)
    @JoinColumn({ name: 'participant_id', referencedColumnName: 'id' })
    participant: Participant;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
