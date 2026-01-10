const express = require('express');
const bodyParser = require('body-parser');
const resourcesRouter = require('./routes/resources');

const app = express();

app.use(bodyParser.json());

app.use('/api/resources', resourcesRouter);

// Gestione errori semplice
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ success: false, error: 'Errore interno del server' });
});

module.exports = app;
