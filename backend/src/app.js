const express = require('express');
const bodyParser = require('body-parser');
const companyCollaboratorsRoutes = require('./routes/companyCollaboratorsRoutes');

const app = express();

app.use(bodyParser.json());

// Altre route già esistenti saranno montate qui.

app.use('/api', companyCollaboratorsRoutes);

// Gestione errori standard del progetto
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Errore interno del server';
  res.status(status).json({ message, code: err.code || 'GENERIC_ERROR' });
});

module.exports = app;
