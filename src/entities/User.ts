import * as argon2 from 'argon2';
import { Entity, Column, PrimaryColumn, BeforeInsert, BeforeUpdate, AfterLoad } from 'typeorm';
import { IsEmail, validateOrReject } from 'class-validator';

@Entity('users')
export class User {
    @PrimaryColumn()
    username: string;

    @Column()
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

    @Column({ name: 'created_at', default: 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    private tempPassword: string;

    @AfterLoad()
    rememberPassword() {
        if (this.password) {
            this.tempPassword = this.password;
        }
    }

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }

    @BeforeInsert()
    @BeforeUpdate()
    async encryptPassword() {
        if (!this.password) return;
        if (this.tempPassword === this.password) return;

        this.password = await argon2.hash(this.password);
    }
}
