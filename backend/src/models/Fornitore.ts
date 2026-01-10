import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';

export type FornitoreStato = 'ATTIVO' | 'INATTIVO';

@Entity({ name: 'fornitori' })
export class Fornitore {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'ragione_sociale', type: 'varchar', length: 255 })
  ragioneSociale!: string;

  @Index({ unique: true })
  @Column({ name: 'partita_iva', type: 'varchar', length: 16 })
  partitaIva!: string;

  @Column({ name: 'codice_fiscale', type: 'varchar', length: 16, nullable: true })
  codiceFiscale!: string | null;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'telefono', type: 'varchar', length: 50, nullable: true })
  telefono!: string | null;

  @Column({ name: 'indirizzo', type: 'varchar', length: 255, nullable: true })
  indirizzo!: string | null;

  @Column({ name: 'cap', type: 'varchar', length: 10, nullable: true })
  cap!: string | null;

  @Column({ name: 'citta', type: 'varchar', length: 100, nullable: true })
  citta!: string | null;

  @Column({ name: 'provincia', type: 'varchar', length: 2, nullable: true })
  provincia!: string | null;

  @Column({ name: 'stato', type: 'varchar', length: 2, nullable: true })
  stato!: string | null;

  @Column({ name: 'attivo', type: 'boolean', default: true })
  attivo!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 50, nullable: true })
  createdBy!: string | null;

  @Column({ name: 'updated_by', type: 'varchar', length: 50, nullable: true })
  updatedBy!: string | null;
}
