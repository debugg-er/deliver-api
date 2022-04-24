import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity('contacts')
export class Contact {
    @PrimaryColumn({ name: 'user_1' })
    user1: string;

    @PrimaryColumn({ name: 'user_2' })
    user2: string;

    @Column()
    status: 'sent' | 'pending' | 'friend';

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_1', referencedColumnName: 'username' })
    me: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_2', referencedColumnName: 'username' })
    you: User;
}
