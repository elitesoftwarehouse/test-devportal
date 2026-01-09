import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Company } from './Company';

export type ExternalCollaboratorInvitationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'CANCELLED';

@Entity({ name: 'external_collaborator_invitations' })
export class ExternalCollaboratorInvitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName!: string | null;

  @Column({ type: 'text', nullable: true })
  message!: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  token!: string;

  @Column({ type: 'timestamp with time zone' })
  expiresAt!: Date;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'PENDING',
  })
  status!: ExternalCollaboratorInvitationStatus;

  @ManyToOne(() => User, { nullable: false })
  owner!: User;

  @ManyToOne(() => Company, { nullable: false })
  company!: Company;

  @ManyToOne(() => User, { nullable: true })
  acceptedBy!: User | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  acceptedAt!: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
