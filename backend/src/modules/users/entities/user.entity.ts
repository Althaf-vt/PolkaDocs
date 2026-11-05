import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
    @Index({ unique: true })
    @Column({ type: 'text', unique: true, nullable: false })
    email!: string;

    @Column({ name: 'password_hash', type: 'text', nullable: false })
    passwordHash!: string;

    @Column({ type: 'text', nullable: true })
    name!: string | null;
}