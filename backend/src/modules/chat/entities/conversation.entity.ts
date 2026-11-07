import {
    Entity,
    Column,
    Index,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('conversations')
export class Conversation extends BaseEntity {
    @Index('idx_conversations_user')
    @Column({ name: 'user_id', type: 'uuid', nullable: false })
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'text', nullable: true })
    title!: string | null;

    @OneToMany(() => Message, (message) => message.conversation)
    messages!: Message[];
}