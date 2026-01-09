const { ValidationError } = require('sequelize');

/**
 * Errori di dominio specifici per Azienda fornitrice.
 */
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class UniqueConstraintError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'UniqueConstraintError';
    this.field = field;
  }
}

class BusinessValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'BusinessValidationError';
    this.details = details;
  }
}

/**
 * Service per la gestione delle Aziende fornitrici.
 */
class FornitoreAziendaService {
  /**
   * @param {import('../repositories/FornitoreAziendaRepository').FornitoreAziendaRepository} repository
   */
  constructor(repository) {
    this.repository = repository;
  }

  /**
   * Validazione business-level dei dati in ingresso.
   */
  validateInput(input, { isUpdate = false } = {}) {
    const errors = {};

    if (!isUpdate || Object.prototype.hasOwnProperty.call(input, 'ragioneSociale')) {
      if (!input.ragioneSociale || typeof input.ragioneSociale !== 'string' || !input.ragioneSociale.trim()) {
        errors.ragioneSociale = 'La ragione sociale è obbligatoria';
      }
    }

    if (!isUpdate || Object.prototype.hasOwnProperty.call(input, 'partitaIva')) {
      const piva = input.partitaIva;
      if (!piva || typeof piva !== 'string' || !piva.trim()) {
        errors.partitaIva = 'La partita IVA è obbligatoria';
      } else if (piva.length < 11 || piva.length > 16) {
        errors.partitaIva = 'La partita IVA deve avere tra 11 e 16 caratteri';
      }
    }

    if (input.email) {
      const re = /[^@\s]+@[^@\s]+\.[^@\s]+/;
      if (!re.test(input.email)) {
        errors.email = 'Formato email non valido';
      }
    }

    if (Object.keys(errors).length) {
      throw new BusinessValidationError('Dati non validi per Azienda fornitrice', errors);
    }
  }

  async create(data) {
    this.validateInput(data, { isUpdate: false });

    const existing = await this.repository.findByPartitaIva(data.partitaIva);
    if (existing) {
      throw new UniqueConstraintError('Partita IVA già esistente', 'partitaIva');
    }

    try {
      return await this.repository.create({
        ragioneSociale: data.ragioneSociale.trim(),
        partitaIva: data.partitaIva.trim(),
        codiceFiscale: data.codiceFiscale || null,
        email: data.email || null,
        telefono: data.telefono || null,
        indirizzo: data.indirizzo || null,
        attivo: typeof data.attivo === 'boolean' ? data.attivo : true
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        throw new BusinessValidationError('Errore di validazione dal database', err.errors);
      }
      throw err;
    }
  }

  async getById(id) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundError('Azienda fornitrice non trovata');
    }
    return record;
  }

  async update(id, data) {
    this.validateInput(data, { isUpdate: true });

    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Azienda fornitrice non trovata');
    }

    if (data.partitaIva && data.partitaIva !== existing.partitaIva) {
      const pivaDuplicate = await this.repository.findByPartitaIva(data.partitaIva);
      if (pivaDuplicate) {
        throw new UniqueConstraintError('Partita IVA già esistente', 'partitaIva');
      }
    }

    try {
      return await this.repository.update(id, data);
    } catch (err) {
      if (err instanceof ValidationError) {
        throw new BusinessValidationError('Errore di validazione dal database', err.errors);
      }
      throw err;
    }
  }

  async setStato(id, attivo) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError('Azienda fornitrice non trovata');
    }
    return this.repository.update(id, { attivo });
  }

  async list({ soloAttivi } = {}) {
    const filter = {};
    if (typeof soloAttivi === 'boolean') {
      filter.attivo = soloAttivi;
    }
    return this.repository.list(filter);
  }
}

module.exports = {
  FornitoreAziendaService,
  NotFoundError,
  UniqueConstraintError,
  BusinessValidationError
};
