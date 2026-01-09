const { Op } = require('sequelize');

/**
 * Repository per la gestione delle Aziende fornitrici.
 * Incapsula l'accesso a Sequelize e fornisce un'interfaccia semplice al servizio.
 */
class FornitoreAziendaRepository {
  /**
   * @param {import('sequelize').Model} FornitoreAziendaModel
   */
  constructor(FornitoreAziendaModel) {
    this.FornitoreAzienda = FornitoreAziendaModel;
  }

  async create(data) {
    return this.FornitoreAzienda.create(data);
  }

  async findById(id) {
    return this.FornitoreAzienda.findByPk(id);
  }

  async findByPartitaIva(partitaIva) {
    return this.FornitoreAzienda.findOne({ where: { partitaIva } });
  }

  async update(id, data) {
    const record = await this.findById(id);
    if (!record) {
      return null;
    }
    return record.update(data);
  }

  async delete(id) {
    const record = await this.findById(id);
    if (!record) {
      return 0;
    }
    await record.destroy();
    return 1;
  }

  /**
   * Lista fornitori con filtro opzionale su stato attivo.
   * @param {{attivo?: boolean}} filter
   */
  async list(filter = {}) {
    const where = {};
    if (typeof filter.attivo === 'boolean') {
      where.attivo = filter.attivo;
    }
    return this.FornitoreAzienda.findAll({ where, order: [['ragioneSociale', 'ASC']] });
  }
}

module.exports = {
  FornitoreAziendaRepository
};
