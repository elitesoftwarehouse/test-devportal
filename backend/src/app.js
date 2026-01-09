const express = require('express');
const bodyParser = require('body-parser');
const professionalProfileRoutes = require('./routes/professionalProfileRoutes');

const app = express();

app.use(bodyParser.json());

// Middleware fittizio per popolare req.user (integrazione con auth reale nel progetto principale)
app.use((req, res, next) => {
  // In produzione, sostituire con logica JWT/Sessione esistente
  req.user = req.user || { id: 1 }; // placeholder
  next();
});

app.use('/api/professional-profile', professionalProfileRoutes);

module.exports = app;
