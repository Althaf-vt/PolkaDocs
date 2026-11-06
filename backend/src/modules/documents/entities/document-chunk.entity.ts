import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { User } from '../../users/entities/user.entity';

@Entity('document_chunks')
export class DocumentChunk {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index('idx_chunks_document')
    @Column({ name: 'document_id', type: 'uuid', nullable: false })
    documentId!: string;

    @ManyToOne(() => Document, (document) => document.chunks, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'document_id' })
    document!: Document;

    @Index('idx_chunks_user')
    @Column({ name: 'user_id', type: 'uuid', nullable: false })
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ name: 'chunk_index', type: 'int', nullable: false })
    chunkIndex!: number;

    @Column({ type: 'text', nullable: false })
    content!: string;

    @Column({ type: 'jsonb', default: () => "'{}'" })
    metadata!: Record<string, unknown>;

    @Column({ type: 'text', select: false })
    embedding!: string;
}