import {
    Entity,
    Column,
    BeforeInsert,
    BeforeUpdate,
    ManyToOne,
    JoinColumn,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { IsIn, validateOrReject } from 'class-validator';
import { Conversation } from './Conversation';
import { Message } from './Message';
import { User } from './User';

@Entity('participants')
export class Participant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    nickname: string | null;

    @Column({ type: 'text' })
    @IsIn(['member', 'admin'])
    role: 'member' | 'admin';

    @Column({ name: 'joined_at', default: 'CURRENT_TIMESTAMP' })
    joinedAt: Date;

    @Column({ type: 'timestamp', name: 'removed_at' })
    removedAt: Date | null;

    @Column({ type: 'bigint', name: 'seen_message_id', select: false })
    seenMessageId?: string | null;

    @Column({ type: 'bigint', name: 'delivered_message_id', select: false })
    deliveredMessageId?: string | null;

    @Column({ type: 'int', name: 'conversation_id', select: false })
    conversationId?: number;

    @OneToMany(() => Message, (message) => message.participant)
    messages: Array<Message>;

    @ManyToOne(() => Conversation, (conversation) => conversation.participants)
    @JoinColumn({ name: 'conversation_id', referencedColumnName: 'id' })
    conversation: Conversation;

    @ManyToOne(() => User, (user) => user.participants)
    @JoinColumn({ name: 'user', referencedColumnName: 'username' })
    user: User;

    seen: boolean;
    delivered: boolean;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
