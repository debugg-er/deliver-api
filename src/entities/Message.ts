import {
    Entity,
    Column,
    // PrimaryColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { validateOrReject } from 'class-validator';
import { Attachment } from './Attachment';
import { Participant } from './Participant';
import { MessageReaction } from './MessageReaction';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn({ type: 'integer' })
    id: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'text' })
    type: 'update' | null;

    @Column({ type: 'time with time zone', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', name: 'revoked_at' })
    revokedAt: Date | null;

    @OneToMany(() => Attachment, (attachment) => attachment.message)
    attachments: Array<Attachment>;

    @Column({ name: 'participant_id' })
    participantId: number;

    @ManyToOne(() => Participant, (participant) => participant.messages)
    @JoinColumn({ name: 'participant_id', referencedColumnName: 'id' })
    participant: Participant;

    @ManyToOne(() => Message, (message) => message.replies)
    @JoinColumn({ name: 'parent_id', referencedColumnName: 'id' })
    parent: Message;

    @OneToMany(() => Message, (message) => message.parent)
    replies: Array<Message>;

    @OneToMany(() => MessageReaction, (messageReaction) => messageReaction.message)
    reactions: Array<MessageReaction>;

    seenParticipants: Array<Participant>;
    deliveredParticipants: Array<Participant>;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
