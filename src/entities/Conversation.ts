import { Entity, Column, PrimaryColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsIn, validateOrReject } from 'class-validator';

@Entity('conversations')
export class Conversation {
    @PrimaryColumn()
    id: number;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'text' })
    @IsIn(['personal', 'group'])
    type: 'personal' | 'group';

    @Column({ name: 'created_at', default: 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
