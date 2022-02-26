import { Entity, Column, PrimaryColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsEmail, validateOrReject } from 'class-validator';

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

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
