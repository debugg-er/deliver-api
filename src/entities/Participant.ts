import {
    Entity,
    Column,
    PrimaryColumn,
    BeforeInsert,
    BeforeUpdate,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { IsIn, validateOrReject } from 'class-validator';
import { Conversation } from './Conversation';
import { Message } from './Message';
import { User } from './User';

@Entity('participants')
export class Participant {
    @PrimaryColumn()
    id: number;

    @Column({ type: 'text' })
    nickname: string | null;

    @Column({ type: 'text' })
    @IsIn(['participant', 'admin'])
    role: 'participant' | 'admin';

    @Column({ name: 'joined_at', default: 'CURRENT_TIMESTAMP' })
    joinedAt: Date;

    @Column({ type: 'timestamp', name: 'removed_at' })
    removed_at: Date | null;

    @OneToMany(() => Message, (message) => message.participant)
    messages: Array<Message>;

    @ManyToOne(() => Conversation, (conversation) => conversation.participants)
    @JoinColumn({ name: 'conversation_id', referencedColumnName: 'id' })
    conversation: Conversation;

    @ManyToOne(() => User, (user) => user.participants)
    @JoinColumn({ name: 'user', referencedColumnName: 'username' })
    user: User;

    @ManyToOne(() => Message)
    @JoinColumn({ name: 'seen_message_id', referencedColumnName: 'id' })
    seenMessage: Message;

    @ManyToOne(() => Message)
    @JoinColumn({ name: 'delivered_message_id', referencedColumnName: 'id' })
    deliveredMessage: Message;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
