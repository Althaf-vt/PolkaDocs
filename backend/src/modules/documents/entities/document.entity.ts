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
import { DocumentChunk } from './document-chunk.entity';
import type { SupportedMimeType } from '../constants/mime-types.constant';

export type DocumentStatus = 'uploaded' | 'processing' | 'ready' | 'failed';

@Entity('documents')
export class Document extends BaseEntity {
    @Index('idx_documents_user')
    @Column({ name: 'user_id', type: 'uuid', nullable: false })
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ name: 'file_name', type: 'text', nullable: false })
    fileName!: string;

    @Column({ name: 'mime_type', type: 'text', nullable: false })
    mimeType!: SupportedMimeType;

    @Column({ name: 'size_bytes', type: 'bigint', nullable: false })
    sizeBytes!: number;

    @Column({ name: 'storage_path', type: 'text', nullable: false })
    storagePath!: string;

    @Column({
        type: 'text',
        default: 'uploaded',
    })
    status!: DocumentStatus;

    @Column({ name: 'failure_reason', type: 'text', nullable: true })
    failureReason!: string | null;

    @OneToMany(() => DocumentChunk, (chunk) => chunk.document)
    chunks!: DocumentChunk[];
}