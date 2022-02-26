import { Entity, Column, PrimaryColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { IsIn, validateOrReject } from 'class-validator';

@Entity('participants')
export class Participant {
    @PrimaryColumn()
    id: number;

    @Column({ type: 'text' })
    nickname: string | null;

    @Column({ type: 'text' })
    @IsIn(['participant', 'admin'])
    role: 'participant' | 'admin';

    @Column({ name: 'joined_at', default: 'CURRENT_TIMESTAMP' })
    joinedAt: Date;

    @Column({ type: 'timestamp', name: 'removed_at' })
    removed_at: Date | null;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this, { skipMissingProperties: true });
    }
}
