const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// In-memory store solo per ambienti di test / sviluppo
let professionalProfileStore = {
  hasProfile: false,
  profile: null
};

// Middleware per simulare errori API in base a header usato dai test E2E
app.use((req, res, next) => {
  const simulateError = req.headers['x-test-simulate-error'];
  if (simulateError === '500') {
    return res.status(500).json({
      code: 'TEST_SIMULATED_500',
      message: 'Errore interno simulato per test.'
    });
  }
  if (simulateError === '400') {
    return res.status(400).json({
      code: 'TEST_SIMULATED_400',
      message: 'Richiesta non valida simulata per test.'
    });
  }
  next();
});

// Endpoint REST profilo Professionista
app.get('/api/professionista/profilo', (req, res) => {
  if (!professionalProfileStore.hasProfile || !professionalProfileStore.profile) {
    return res.status(404).json({
      code: 'PROFILE_NOT_FOUND',
      message: 'Profilo professionista non ancora creato.'
    });
  }

  return res.json({
    ...professionalProfileStore.profile
  });
});

app.post('/api/professionista/profilo', (req, res) => {
  const payload = req.body || {};

  // Validazioni minime lato server usate anche nei test E2E
  const errors = {};
  if (!payload.nome || typeof payload.nome !== 'string' || !payload.nome.trim()) {
    errors.nome = 'Il nome è obbligatorio.';
  }
  if (!payload.cognome || typeof payload.cognome !== 'string' || !payload.cognome.trim()) {
    errors.cognome = 'Il cognome è obbligatorio.';
  }
  if (!payload.email || typeof payload.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = 'Inserire un indirizzo email valido.';
  }
  if (!payload.codiceFiscale || typeof payload.codiceFiscale !== 'string' || payload.codiceFiscale.length !== 16) {
    errors.codiceFiscale = 'Inserire un codice fiscale valido (16 caratteri).';
  }
  if (payload.partitaIva && (typeof payload.partitaIva !== 'string' || payload.partitaIva.length !== 11)) {
    errors.partitaIva = 'Inserire una partita IVA valida (11 caratteri).';
  }
  if (!payload.cap || typeof payload.cap !== 'string' || !/^\d{5}$/.test(payload.cap)) {
    errors.cap = 'Inserire un CAP valido (5 cifre).';
  }
  if (!payload.telefono || typeof payload.telefono !== 'string' || !/^\+?[0-9]{6,15}$/.test(payload.telefono)) {
    errors.telefono = 'Inserire un numero di telefono valido.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Dati non validi per il profilo professionista.',
      errors
    });
  }

  const sanitizedProfile = {
    nome: payload.nome.trim(),
    cognome: payload.cognome.trim(),
    email: payload.email.trim(),
    codiceFiscale: payload.codiceFiscale.trim().toUpperCase(),
    partitaIva: payload.partitaIva ? payload.partitaIva.trim() : '',
    indirizzo: payload.indirizzo ? payload.indirizzo.trim() : '',
    cap: payload.cap.trim(),
    citta: payload.citta ? payload.citta.trim() : '',
    provincia: payload.provincia ? payload.provincia.trim() : '',
    telefono: payload.telefono.trim()
  };

  professionalProfileStore = {
    hasProfile: true,
    profile: sanitizedProfile
  };

  return res.status(201).json(sanitizedProfile);
});

app.put('/api/professionista/profilo', (req, res) => {
  if (!professionalProfileStore.hasProfile || !professionalProfileStore.profile) {
    return res.status(404).json({
      code: 'PROFILE_NOT_FOUND',
      message: 'Profilo professionista non ancora creato.'
    });
  }

  const payload = req.body || {};
  const current = professionalProfileStore.profile;

  const updated = {
    ...current,
    nome: typeof payload.nome === 'string' ? payload.nome.trim() : current.nome,
    cognome: typeof payload.cognome === 'string' ? payload.cognome.trim() : current.cognome,
    email: typeof payload.email === 'string' ? payload.email.trim() : current.email,
    codiceFiscale: typeof payload.codiceFiscale === 'string' ? payload.codiceFiscale.trim().toUpperCase() : current.codiceFiscale,
    partitaIva: typeof payload.partitaIva === 'string' ? payload.partitaIva.trim() : current.partitaIva,
    indirizzo: typeof payload.indirizzo === 'string' ? payload.indirizzo.trim() : current.indirizzo,
    cap: typeof payload.cap === 'string' ? payload.cap.trim() : current.cap,
    citta: typeof payload.citta === 'string' ? payload.citta.trim() : current.citta,
    provincia: typeof payload.provincia === 'string' ? payload.provincia.trim() : current.provincia,
    telefono: typeof payload.telefono === 'string' ? payload.telefono.trim() : current.telefono
  };

  const errors = {};
  if (!updated.nome) {
    errors.nome = 'Il nome è obbligatorio.';
  }
  if (!updated.cognome) {
    errors.cognome = 'Il cognome è obbligatorio.';
  }
  if (!updated.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updated.email)) {
    errors.email = 'Inserire un indirizzo email valido.';
  }
  if (!updated.codiceFiscale || updated.codiceFiscale.length !== 16) {
    errors.codiceFiscale = 'Inserire un codice fiscale valido (16 caratteri).';
  }
  if (updated.partitaIva && updated.partitaIva.length !== 11) {
    errors.partitaIva = 'Inserire una partita IVA valida (11 caratteri).';
  }
  if (!updated.cap || !/^\d{5}$/.test(updated.cap)) {
    errors.cap = 'Inserire un CAP valido (5 cifre).';
  }
  if (!updated.telefono || !/^\+?[0-9]{6,15}$/.test(updated.telefono)) {
    errors.telefono = 'Inserire un numero di telefono valido.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Dati non validi per il profilo professionista.',
      errors
    });
  }

  professionalProfileStore = {
    hasProfile: true,
    profile: updated
  };

  return res.json(updated);
});

// Esportiamo app per l'uso nel server principale e nei test
module.exports = app;
