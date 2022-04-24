import {
    Entity,
    Column,
    PrimaryColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
    ManyToMany,
    JoinTable,
    JoinColumn,
} from 'typeorm';
import { IsEmail, validateOrReject } from 'class-validator';
import { Participant } from './Participant';
import { Conversation } from './Conversation';
import VirtualColumn from '../generals/VirtualColumn';
import { Contact } from './Contact';

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
    avatarPath: string | null;

    @Column({ name: 'female' })
    female: boolean;

    @Column({ name: 'is_active', default: false })
    isActive: boolean;

    @Column({ name: 'created_at', default: 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @VirtualColumn('character varying')
    status: Contact['status'];

    @OneToMany(() => Participant, (participant) => participant.user)
    participants: Array<Participant>;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'block_lists',
        joinColumn: { name: 'user_1', referencedColumnName: 'username' },
        inverseJoinColumn: { name: 'user_2', referencedColumnName: 'username' },
    })
    blockedUsers: Array<User>;

    @OneToMany(() => Contact, (contact) => contact.me)
    @JoinColumn({ name: 'username', referencedColumnName: 'user1' })
    contacts: Array<Contact>;

    @OneToMany(() => Contact, (contact) => contact.you)
    @JoinColumn({ name: 'username', referencedColumnName: 'user2' })
    contactsOf: Array<Contact>;

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
