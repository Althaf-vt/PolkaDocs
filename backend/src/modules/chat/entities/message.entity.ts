import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { Citation } from '../interfaces/citation.interface';

export type MessageRole = 'user' | 'assistant';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index('idx_messages_conversation')
    @Column({ name: 'conversation_id', type: 'uuid', nullable: false })
    conversationId!: string;

    @ManyToOne(() => Conversation, (conv) => conv.messages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'conversation_id' })
    conversation!: Conversation;

    @Column({ type: 'text', nullable: false })
    role!: MessageRole;

    @Column({ type: 'text', nullable: false })
    content!: string;

    @Column({ type: 'jsonb', default: () => "'[]'" })
    citations!: Citation[];

    @Column({ name: 'prompt_tokens', type: 'int', nullable: true })
    promptTokens!: number | null;

    @Column({ name: 'completion_tokens', type: 'int', nullable: true })
    completionTokens!: number | null;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamptz',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt!: Date;
}