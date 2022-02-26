import { Entity, Column, PrimaryColumn, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import { validateOrReject } from 'class-validator';
import { Attachment } from './Attachment';

@Entity('messages')
export class Message {
    @PrimaryColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'text' })
    content: string;

    @Column({ name: 'created_at', default: 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', name: 'revoked_at' })
    revoked_at: Date;

    @OneToMany(() => Attachment, (attachment) => attachment.message)
    attachments: Array<Attachment>;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
