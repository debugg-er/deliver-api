import {
    Entity,
    Column,
    PrimaryColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { validateOrReject } from 'class-validator';
import { Attachment } from './Attachment';
import { Participant } from './Participant';
import { MessageReaction } from './MessageReaction';

@Entity('messages')
export class Message {
    @PrimaryColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'text' })
    content: string;

    @Column({ name: 'created_at', default: 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', name: 'revoked_at' })
    revoked_at: Date;

    @OneToMany(() => Attachment, (attachment) => attachment.message)
    attachments: Array<Attachment>;

    @Column({ name: 'participant_id' })
    participantId: number;

    @ManyToOne(() => Participant, (participant) => participant.messages)
    @JoinColumn({ name: 'participant_id', referencedColumnName: 'id' })
    participant: Participant;

    @ManyToOne(() => Message, (message) => message.replies)
    @JoinColumn({ name: 'reply_of', referencedColumnName: 'id' })
    parent: Message;

    @OneToMany(() => Message, (message) => message.parent)
    replies: Array<Message>;

    @OneToMany(() => MessageReaction, (messageReaction) => messageReaction.message)
    reactions: Array<MessageReaction>;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
