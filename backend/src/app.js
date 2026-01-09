const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const profileUnifiedRoutes = require('./routes/profileUnifiedRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Middleware esempio per simulare l'utente loggato
app.use((req, res, next) => {
  // In produzione questo verrebbe da un sistema di auth/JWT
  // Qui forziamo ADMIN per mostrare i campi extra
  req.user = { id: 'u1', role: process.env.MOCK_ROLE || 'ADMIN' };
  next();
});

// Altre route esistenti...

app.use('/api/profiles', profileUnifiedRoutes);

// Gestione errori generica
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: 'Errore interno del server.' });
});

module.exports = app;
