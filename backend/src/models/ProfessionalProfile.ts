import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity({ name: 'professional_profiles' })
@Unique('UQ_professional_profile_user', ['userId'])
export class ProfessionalProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'nome', type: 'varchar', length: 100 })
  nome!: string;

  @Column({ name: 'cognome', type: 'varchar', length: 100 })
  cognome!: string;

  @Column({ name: 'codice_fiscale', type: 'varchar', length: 16, nullable: true })
  codiceFiscale: string | null = null;

  @Column({ name: 'partita_iva', type: 'varchar', length: 11, nullable: true })
  partitaIva: string | null = null;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string | null = null;

  @Column({ name: 'pec', type: 'varchar', length: 255, nullable: true })
  pec: string | null = null;

  @Column({ name: 'telefono', type: 'varchar', length: 30, nullable: true })
  telefono: string | null = null;

  @Column({ name: 'cellulare', type: 'varchar', length: 30, nullable: true })
  cellulare: string | null = null;

  @Column({ name: 'indirizzo', type: 'varchar', length: 255, nullable: true })
  indirizzo: string | null = null;

  @Column({ name: 'cap', type: 'varchar', length: 10, nullable: true })
  cap: string | null = null;

  @Column({ name: 'citta', type: 'varchar', length: 100, nullable: true })
  citta: string | null = null;

  @Column({ name: 'provincia', type: 'varchar', length: 2, nullable: true })
  provincia: string | null = null;
}
