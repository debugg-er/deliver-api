import { Entity, Column, PrimaryColumn } from 'typeorm';
import { IsEmail } from 'class-validator';

@Entity('users')
export class User {
    @PrimaryColumn()
    username: string;

    @Column()
    password: string;

    @Column({ name: 'first_name' })
    firstName: string | null;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column()
    @IsEmail()
    email: string;

    @Column({ name: 'is_verified' })
    isVerified: string;

    @Column({ name: 'avatar_path' })
    avatar: string | null;

    @Column({ name: 'joined_at' })
    joinedAt: Date | null;
}
