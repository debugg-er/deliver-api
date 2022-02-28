import {
    Entity,
    Column,
    PrimaryColumn,
    BeforeInsert,
    BeforeUpdate,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { validateOrReject } from 'class-validator';
import { Message } from './Message';

@Entity('attachments')
export class Attachment {
    @PrimaryColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'attachment_path', type: 'text' })
    attachmentPath: string;

    @ManyToOne(() => Message, (message) => message.attachments)
    @JoinColumn({ name: 'message_id', referencedColumnName: 'id' })
    message: Message;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
