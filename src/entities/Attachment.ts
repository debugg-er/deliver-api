import {
    Entity,
    Column,
    BeforeInsert,
    BeforeUpdate,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { validateOrReject } from 'class-validator';
import { Message } from './Message';

@Entity('attachments')
export class Attachment {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column({ name: 'attachment_path', type: 'text' })
    attachmentPath: string;

    @Column({ name: 'type', type: 'text' })
    type: 'file' | 'video' | 'image';

    @ManyToOne(() => Message, (message) => message.attachments)
    @JoinColumn({ name: 'message_id', referencedColumnName: 'id' })
    message: Message;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
