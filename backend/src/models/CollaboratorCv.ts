import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn
} from 'typeorm';
import { Collaborator } from './Collaborator';
import { User } from './User';

export type CollaboratorCvStatus = 'CURRENT' | 'HISTORIC' | 'DELETED';

@Entity({ name: 'collaborator_cvs' })
export class CollaboratorCv {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Collaborator, (c) => c.cvs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collaborator_id' })
  collaborator!: Collaborator;

  @Column({ name: 'collaborator_id' })
  collaboratorId!: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500 })
  filePath!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType!: string;

  @Column({ name: 'file_size_bytes', type: 'bigint' })
  fileSizeBytes!: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploadedBy?: User | null;

  @Column({ name: 'uploaded_by_user_id', nullable: true })
  uploadedByUserId?: string | null;

  @Column({
    type: 'enum',
    enum: ['CURRENT', 'HISTORIC', 'DELETED'],
    default: 'CURRENT',
  })
  status!: CollaboratorCvStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
