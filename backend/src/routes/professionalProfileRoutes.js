const express = require('express');
const ProfessionalProfile = require('../models/ProfessionalProfile');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Helpers di validazione lato server (coerenti con il client)
const CF_REGEX = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
const PIVA_REGEX = /^[0-9]{11}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePayload(body) {
  const errors = {};

  if (!body.firstName || !body.firstName.trim()) {
    errors.firstName = 'Nome obbligatorio';
  }
  if (!body.lastName || !body.lastName.trim()) {
    errors.lastName = 'Cognome obbligatorio';
  }
  if (!body.email || !EMAIL_REGEX.test(body.email)) {
    errors.email = 'Email non valida';
  }
  if (!body.fiscalCode || !CF_REGEX.test(body.fiscalCode)) {
    errors.fiscalCode = 'Codice fiscale non valido';
  }
  if (body.vatNumber && !PIVA_REGEX.test(body.vatNumber)) {
    errors.vatNumber = 'Partita IVA non valida';
  }

  return errors;
}

// GET /api/professional-profile - restituisce il profilo dell'utente loggato (404 se assente)
router.get('/', requireAuth, async (req, res) => {
  try {
    const profile = await ProfessionalProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(404).json({ message: 'Profilo Professionista non presente' });
    }
    return res.json(profile);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('GET /api/professional-profile error', err);
    return res.status(500).json({ message: 'Errore durante il caricamento del profilo' });
  }
});

// POST /api/professional-profile - crea il profilo se assente
router.post('/', requireAuth, async (req, res) => {
  try {
    const existing = await ProfessionalProfile.findOne({ where: { userId: req.user.id } });
    if (existing) {
      return res.status(409).json({ message: 'Profilo Professionista già esistente' });
    }

    const errors = validatePayload(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Dati non validi', errors });
    }

    const profile = await ProfessionalProfile.create({
      ...req.body,
      userId: req.user.id,
    });

    return res.status(201).json(profile);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('POST /api/professional-profile error', err);
    return res.status(500).json({ message: 'Errore durante la creazione del profilo' });
  }
});

// PUT /api/professional-profile - aggiorna completamente il profilo (upsert-like, ma se non esiste -> 404)
router.put('/', requireAuth, async (req, res) => {
  try {
    const profile = await ProfessionalProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(404).json({ message: 'Profilo Professionista non presente' });
    }

    const errors = validatePayload(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Dati non validi', errors });
    }

    await profile.update(req.body);
    return res.json(profile);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('PUT /api/professional-profile error', err);
    return res.status(500).json({ message: 'Errore durante l\'aggiornamento del profilo' });
  }
});

// PATCH /api/professional-profile - aggiornamento parziale
router.patch('/', requireAuth, async (req, res) => {
  try {
    const profile = await ProfessionalProfile.findOne({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(404).json({ message: 'Profilo Professionista non presente' });
    }

    // Per semplicità riutilizziamo la stessa validazione ma solo sui campi presenti
    const full = { ...profile.toJSON(), ...req.body };
    const errors = validatePayload(full);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Dati non validi', errors });
    }

    await profile.update(req.body);
    return res.json(profile);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('PATCH /api/professional-profile error', err);
    return res.status(500).json({ message: 'Errore durante l\'aggiornamento del profilo' });
  }
});

module.exports = router;
