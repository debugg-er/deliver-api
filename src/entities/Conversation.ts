import {
    Entity,
    Column,
    PrimaryColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
    JoinTable,
    ManyToMany,
    getRepository,
} from 'typeorm';
import { IsIn, validateOrReject } from 'class-validator';
import { Participant } from './Participant';
import { Message } from './Message';

@Entity('conversations')
export class Conversation {
    @PrimaryColumn()
    id: number;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'text' })
    @IsIn(['personal', 'group'])
    type: 'personal' | 'group';

    @Column({ name: 'created_at', default: 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @OneToMany(() => Participant, (participant) => participant.conversation)
    participants: Array<Participant>;

    @ManyToMany(() => Message)
    @JoinTable({
        name: 'participants',
        inverseJoinColumn: { name: 'id', referencedColumnName: 'participantId' },
        joinColumn: { name: 'conversation_id', referencedColumnName: 'id' },
    })
    messages: Array<Message>;

    lastMessage: Message | null;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
