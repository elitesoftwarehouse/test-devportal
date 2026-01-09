const express = require('express');
const bodyParser = require('body-parser');

const companyAccreditationRoutes = require('./routes/companyAccreditationRoutes');

const app = express();

app.use(bodyParser.json());

// Middleware placeholder per simulare utente autenticato in sviluppo
app.use((req, res, next) => {
  // Integrazione reale: leggere da sessione / token JWT
  req.user = { id: 1, email: 'owner@example.com' };
  next();
});

app.use(companyAccreditationRoutes);

module.exports = app;
