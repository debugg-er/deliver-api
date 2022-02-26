import { Entity, Column, PrimaryColumn, BeforeInsert, BeforeUpdate, ManyToOne } from 'typeorm';
import { validateOrReject } from 'class-validator';
import { Message } from './Message';

@Entity('attachments')
export class Attachment {
    @PrimaryColumn({ type: 'bigint' })
    id: number;

    @Column({ type: 'text' })
    attachmentPath: string;

    @ManyToOne(() => Message, (message) => message.attachments)
    message: Message;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
