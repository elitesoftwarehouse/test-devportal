import { Fornitore } from '../models/Fornitore';
import { FornitoreRepository } from '../repositories/FornitoreRepository';
import {
  FornitoreCreateDTO,
  FornitoreUpdateDTO,
  FornitoreStatoUpdateDTO,
  validateFornitoreCreate,
  validateFornitoreUpdate,
  validateFornitoreStatoUpdate
} from '../validators/fornitoreValidator';

export interface ServiceError {
  status: number;
  code: string;
  message: string;
  details?: any;
}

export class FornitoreService {
  private repository: FornitoreRepository;

  constructor(repository: FornitoreRepository) {
    this.repository = repository;
  }

  async createFornitore(payload: FornitoreCreateDTO, currentUserId: string | null): Promise<Fornitore | ServiceError> {
    const validationErrors = validateFornitoreCreate(payload);
    if (validationErrors.length > 0) {
      return {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Dati fornitore non validi',
        details: validationErrors
      };
    }

    const existing = await this.repository.findByPartitaIva(payload.partitaIva);
    if (existing) {
      return {
        status: 409,
        code: 'DUPLICATE_PARTITA_IVA',
        message: 'Esiste già un fornitore con la stessa Partita IVA',
        details: { field: 'partitaIva' }
      };
    }

    const data: Partial<Fornitore> = {
      ragioneSociale: payload.ragioneSociale.trim(),
      partitaIva: payload.partitaIva.trim(),
      codiceFiscale: payload.codiceFiscale ? payload.codiceFiscale.trim().toUpperCase() : null,
      email: payload.email.trim(),
      telefono: payload.telefono?.trim() ?? null,
      indirizzo: payload.indirizzo?.trim() ?? null,
      cap: payload.cap?.trim() ?? null,
      citta: payload.citta?.trim() ?? null,
      provincia: payload.provincia?.trim().toUpperCase() ?? null,
      stato: payload.stato?.trim().toUpperCase() ?? null,
      attivo: true,
      createdBy: currentUserId,
      updatedBy: currentUserId
    };

    const created = await this.repository.createAndSave(data);
    return created;
  }

  async getFornitore(id: string): Promise<Fornitore | ServiceError> {
    const fornitore = await this.repository.findById(id);
    if (!fornitore) {
      return {
        status: 404,
        code: 'FORNITORE_NOT_FOUND',
        message: 'Fornitore non trovato'
      };
    }
    return fornitore;
  }

  async listFornitori(params: {
    search?: string;
    attivo?: boolean | null;
    page?: number;
    pageSize?: number;
  }): Promise<{ data: Fornitore[]; total: number; page: number; pageSize: number }> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? Math.min(params.pageSize, 100) : 20;

    const { data, total } = await this.repository.findAll({
      search: params.search,
      attivo: params.attivo,
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return { data, total, page, pageSize };
  }

  async updateFornitore(id: string, payload: FornitoreUpdateDTO, currentUserId: string | null): Promise<Fornitore | ServiceError> {
    const validationErrors = validateFornitoreUpdate(payload);
    if (validationErrors.length > 0) {
      return {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Dati fornitore non validi',
        details: validationErrors
      };
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      return {
        status: 404,
        code: 'FORNITORE_NOT_FOUND',
        message: 'Fornitore non trovato'
      };
    }

    if (payload.partitaIva && payload.partitaIva !== existing.partitaIva) {
      const duplicated = await this.repository.findByPartitaIva(payload.partitaIva);
      if (duplicated && duplicated.id !== id) {
        return {
          status: 409,
          code: 'DUPLICATE_PARTITA_IVA',
          message: 'Esiste già un fornitore con la stessa Partita IVA',
          details: { field: 'partitaIva' }
        };
      }
    }

    if (payload.ragioneSociale !== undefined) {
      existing.ragioneSociale = payload.ragioneSociale.trim();
    }
    if (payload.partitaIva !== undefined) {
      existing.partitaIva = payload.partitaIva.trim();
    }
    if (payload.codiceFiscale !== undefined) {
      existing.codiceFiscale = payload.codiceFiscale ? payload.codiceFiscale.trim().toUpperCase() : null;
    }
    if (payload.email !== undefined) {
      existing.email = payload.email.trim();
    }
    if (payload.telefono !== undefined) {
      existing.telefono = payload.telefono ? payload.telefono.trim() : null;
    }
    if (payload.indirizzo !== undefined) {
      existing.indirizzo = payload.indirizzo ? payload.indirizzo.trim() : null;
    }
    if (payload.cap !== undefined) {
      existing.cap = payload.cap ? payload.cap.trim() : null;
    }
    if (payload.citta !== undefined) {
      existing.citta = payload.citta ? payload.citta.trim() : null;
    }
    if (payload.provincia !== undefined) {
      existing.provincia = payload.provincia ? payload.provincia.trim().toUpperCase() : null;
    }
    if (payload.stato !== undefined) {
      existing.stato = payload.stato ? payload.stato.trim().toUpperCase() : null;
    }

    existing.updatedBy = currentUserId;

    const updated = await this.repository.updateAndSave(existing);
    return updated;
  }

  async updateStatoFornitore(id: string, payload: FornitoreStatoUpdateDTO, currentUserId: string | null): Promise<Fornitore | ServiceError> {
    const validationErrors = validateFornitoreStatoUpdate(payload);
    if (validationErrors.length > 0) {
      return {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Dati stato non validi',
        details: validationErrors
      };
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      return {
        status: 404,
        code: 'FORNITORE_NOT_FOUND',
        message: 'Fornitore non trovato'
      };
    }

    existing.attivo = payload.attivo;
    existing.updatedBy = currentUserId;

    const updated = await this.repository.updateAndSave(existing);
    return updated;
  }
}
