import { Repository } from 'typeorm';
import { ProfessionalProfile } from '../models/ProfessionalProfile';
import { ProfessionalProfileDto } from '../dto/ProfessionalProfileDto';
import { validateProfessionalProfileInput } from '../validators/professionalProfileValidators';

export class ProfessionalProfileService {
  private repository: Repository<ProfessionalProfile>;

  constructor(repository: Repository<ProfessionalProfile>) {
    this.repository = repository;
  }

  async getProfileByUserId(requestingUserId: string, targetUserId: string): Promise<ProfessionalProfileDto> {
    this.ensureOwnership(requestingUserId, targetUserId);

    const entity = await this.repository.findOne({ where: { userId: targetUserId } });
    if (!entity) {
      throw new Error('PROFILE_NOT_FOUND');
    }
    return this.toDto(entity);
  }

  async createProfileForUser(userId: string, input: ProfessionalProfileDto): Promise<ProfessionalProfileDto> {
    this.ensureOwnership(userId, input.userId ?? userId);

    const existing = await this.repository.findOne({ where: { userId } });
    if (existing) {
      throw new Error('PROFILE_ALREADY_EXISTS');
    }

    const errors = validateProfessionalProfileInput(input);
    if (errors.length > 0) {
      const err = new Error('VALIDATION_ERROR');
      // @ts-ignore
      err.details = errors;
      throw err;
    }

    const entity = this.repository.create();
    entity.userId = userId;
    entity.nome = input.nome.trim();
    entity.cognome = input.cognome.trim();
    entity.codiceFiscale = input.codiceFiscale?.trim() ?? null;
    entity.partitaIva = input.partitaIva?.trim() ?? null;
    entity.email = input.email?.trim() ?? null;
    entity.pec = input.pec?.trim() ?? null;
    entity.telefono = input.telefono?.trim() ?? null;
    entity.cellulare = input.cellulare?.trim() ?? null;
    entity.indirizzo = input.indirizzo?.trim() ?? null;
    entity.cap = input.cap?.trim() ?? null;
    entity.citta = input.citta?.trim() ?? null;
    entity.provincia = input.provincia?.trim()?.toUpperCase() ?? null;

    const saved = await this.repository.save(entity);
    return this.toDto(saved);
  }

  async updateProfileForUser(userId: string, input: ProfessionalProfileDto): Promise<ProfessionalProfileDto> {
    const targetUserId = input.userId ?? userId;
    this.ensureOwnership(userId, targetUserId);

    const existing = await this.repository.findOne({ where: { userId: targetUserId } });
    if (!existing) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    const errors = validateProfessionalProfileInput(input);
    if (errors.length > 0) {
      const err = new Error('VALIDATION_ERROR');
      // @ts-ignore
      err.details = errors;
      throw err;
    }

    // Aggiornamento campi obbligatori
    if (input.nome !== undefined) {
      existing.nome = input.nome.trim();
    }
    if (input.cognome !== undefined) {
      existing.cognome = input.cognome.trim();
    }

    // Campi opzionali: se passati come stringa vuota o null, azzeriamo
    if (input.codiceFiscale !== undefined) {
      existing.codiceFiscale = input.codiceFiscale ? input.codiceFiscale.trim() : null;
    }
    if (input.partitaIva !== undefined) {
      existing.partitaIva = input.partitaIva ? input.partitaIva.trim() : null;
    }
    if (input.email !== undefined) {
      existing.email = input.email ? input.email.trim() : null;
    }
    if (input.pec !== undefined) {
      existing.pec = input.pec ? input.pec.trim() : null;
    }
    if (input.telefono !== undefined) {
      existing.telefono = input.telefono ? input.telefono.trim() : null;
    }
    if (input.cellulare !== undefined) {
      existing.cellulare = input.cellulare ? input.cellulare.trim() : null;
    }
    if (input.indirizzo !== undefined) {
      existing.indirizzo = input.indirizzo ? input.indirizzo.trim() : null;
    }
    if (input.cap !== undefined) {
      existing.cap = input.cap ? input.cap.trim() : null;
    }
    if (input.citta !== undefined) {
      existing.citta = input.citta ? input.citta.trim() : null;
    }
    if (input.provincia !== undefined) {
      existing.provincia = input.provincia ? input.provincia.trim().toUpperCase() : null;
    }

    const saved = await this.repository.save(existing);
    return this.toDto(saved);
  }

  private ensureOwnership(requestingUserId: string, targetUserId: string): void {
    if (requestingUserId !== targetUserId) {
      throw new Error('FORBIDDEN');
    }
  }

  private toDto(entity: ProfessionalProfile): ProfessionalProfileDto {
    return {
      id: entity.id,
      userId: entity.userId,
      nome: entity.nome,
      cognome: entity.cognome,
      codiceFiscale: entity.codiceFiscale,
      partitaIva: entity.partitaIva,
      email: entity.email,
      pec: entity.pec,
      telefono: entity.telefono,
      cellulare: entity.cellulare,
      indirizzo: entity.indirizzo,
      cap: entity.cap,
      citta: entity.citta,
      provincia: entity.provincia,
    };
  }
}
