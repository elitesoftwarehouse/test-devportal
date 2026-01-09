const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(bodyParser.json());

app.use('/api', authRoutes);

// Error handler standard
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log reali sarebbero gestiti da un logger centralizzato
  // console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Errore interno del server',
  });
});

module.exports = app;
