const express = require('express');
const { FornitoreAziendaService, NotFoundError, UniqueConstraintError, BusinessValidationError } = require('../../services/FornitoreAziendaService');
const { FornitoreAziendaRepository } = require('../../repositories/FornitoreAziendaRepository');
const { authAdmin } = require('../middlewares/authAdmin');
const { defineFornitoreAzienda } = require('../../models/FornitoreAzienda');
const { Sequelize } = require('sequelize');

/**
 * In un progetto reale, l'istanza di Sequelize verrebbe condivisa.
 * Qui la creiamo localmente per rendere il file autonomo, ma nell'integrazione
 * col progetto esistente va sostituita con l'istanza globale di DB.
 */
const sequelize = new Sequelize('sqlite::memory:', { logging: false });
const FornitoreAziendaModel = defineFornitoreAzienda(sequelize);

const repository = new FornitoreAziendaRepository(FornitoreAziendaModel);
const service = new FornitoreAziendaService(repository);

const router = express.Router();

function mapDomainToDto(entity) {
  return {
    id: entity.id,
    ragioneSociale: entity.ragioneSociale,
    partitaIva: entity.partitaIva,
    codiceFiscale: entity.codiceFiscale,
    email: entity.email,
    telefono: entity.telefono,
    indirizzo: entity.indirizzo,
    attivo: entity.attivo,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt
  };
}

// Crea una nuova azienda fornitrice
router.post('/fornitori-aziende', authAdmin, async (req, res) => {
  try {
    const entity = await service.create(req.body);
    return res.status(201).json(mapDomainToDto(entity));
  } catch (err) {
    if (err instanceof BusinessValidationError) {
      return res.status(400).json({ message: err.message, details: err.details });
    }
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({ message: err.message, field: err.field });
    }
    // fallback generico
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Recupera una azienda fornitrice per ID
router.get('/fornitori-aziende/:id', authAdmin, async (req, res) => {
  try {
    const entity = await service.getById(req.params.id);
    return res.status(200).json(mapDomainToDto(entity));
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Lista aziende fornitrici, opzionalmente solo attive
router.get('/fornitori-aziende', authAdmin, async (req, res) => {
  try {
    const soloAttivi = typeof req.query.soloAttivi !== 'undefined' ? req.query.soloAttivi === 'true' : undefined;
    const list = await service.list({ soloAttivi });
    return res.status(200).json(list.map(mapDomainToDto));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Aggiorna dati di una azienda fornitrice
router.put('/fornitori-aziende/:id', authAdmin, async (req, res) => {
  try {
    const entity = await service.update(req.params.id, req.body);
    return res.status(200).json(mapDomainToDto(entity));
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    if (err instanceof BusinessValidationError) {
      return res.status(400).json({ message: err.message, details: err.details });
    }
    if (err instanceof UniqueConstraintError) {
      return res.status(409).json({ message: err.message, field: err.field });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Cambio stato attivo/inattivo
router.patch('/fornitori-aziende/:id/stato', authAdmin, async (req, res) => {
  try {
    if (typeof req.body.attivo !== 'boolean') {
      return res.status(400).json({ message: "Campo 'attivo' booleano obbligatorio" });
    }
    const entity = await service.setStato(req.params.id, req.body.attivo);
    return res.status(200).json(mapDomainToDto(entity));
  } catch (err) {
    if (err instanceof NotFoundError) {
      return res.status(404).json({ message: err.message });
    }
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Errore interno del server' });
  }
});

// Eliminazione hard (facoltativa, ma utile nei test di integrazione CRUD)
router.delete('/fornitori-aziende/:id', authAdmin, async (req, res) => {
  try {
    const deleted = await repository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Azienda fornitrice non trovata' });
    }
    return res.status(204).send();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: 'Errore interno del server' });
  }
});

module.exports = {
  fornitoriAziendeRouter: router,
  FornitoreAziendaModel,
  sequelize
};
