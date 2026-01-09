import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AccreditationState } from '../domain/accreditamento/company.types';

@Entity({ name: 'companies' })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 16, unique: true })
  vatNumber!: string;

  @Column({ type: 'varchar', length: 4 })
  countryCode!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 32, default: AccreditationState.DRAFT })
  accreditationState!: AccreditationState;
}
