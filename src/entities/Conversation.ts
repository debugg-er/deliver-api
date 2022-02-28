import { Entity, Column, PrimaryColumn, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import { IsIn, validateOrReject } from 'class-validator';
import { Participant } from './Participant';

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
    createdAt: Date;

    @OneToMany(() => Participant, (participant) => participant.conversation)
    participants: Array<Participant>;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
