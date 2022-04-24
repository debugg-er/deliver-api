import {
    Entity,
    Column,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
    JoinTable,
    ManyToMany,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { IsIn, validateOrReject } from 'class-validator';
import { Participant } from './Participant';
import { Message } from './Message';
import VirtualColumn from '../generals/VirtualColumn';

@Entity('conversations')
export class Conversation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'text' })
    @IsIn(['personal', 'group'])
    type: 'personal' | 'group';

    @Column({ name: 'created_at', default: 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @VirtualColumn('text')
    _type?: 'friend' | 'stranger';

    @OneToMany(() => Participant, (participant) => participant.conversation)
    participants: Array<Participant>;

    @ManyToMany(() => Message)
    @JoinTable({
        name: 'participants',
        inverseJoinColumn: { name: 'id', referencedColumnName: 'participantId' },
        joinColumn: { name: 'conversation_id', referencedColumnName: 'id' },
    })
    messages: Array<Message>;

    @ManyToOne(() => Message)
    @JoinColumn({ name: 'last_message_id', referencedColumnName: 'id' })
    lastMessage: Message | null;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
