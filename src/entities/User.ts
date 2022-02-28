import {
    Entity,
    Column,
    PrimaryColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { IsEmail, validateOrReject } from 'class-validator';
import { Participant } from './Participant';
import { Conversation } from './Conversation';

@Entity('users')
export class User {
    @PrimaryColumn()
    username: string;

    @Column({ select: false })
    password: string;

    @Column({ type: 'text', name: 'first_name', default: null })
    firstName: string | null;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column()
    @IsEmail()
    email: string;

    @Column({ type: 'text', name: 'avatar_path', default: null })
    avatar: string | null;

    @Column({ name: 'female' })
    female: boolean;

    @Column({ name: 'is_active', default: false })
    isActive: boolean;

    @Column({ name: 'created_at', default: 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @OneToMany(() => Participant, (participant) => participant.user)
    participants: Array<Participant>;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'block_lists',
        joinColumn: { name: 'user_1', referencedColumnName: 'username' },
        inverseJoinColumn: { name: 'user_2', referencedColumnName: 'username' },
    })
    blockedUsers: Array<User>;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'contacts',
        joinColumn: { name: 'user_1', referencedColumnName: 'username' },
        inverseJoinColumn: { name: 'user_2', referencedColumnName: 'username' },
    })
    contacts: Array<User>;

    @ManyToMany(() => Conversation)
    @JoinTable({
        name: 'participants',
        joinColumn: { name: 'user', referencedColumnName: 'username' },
        inverseJoinColumn: { name: 'conversation_id', referencedColumnName: 'id' },
    })
    conversations: Array<Conversation>;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
