const express = require('express');
const bodyParser = require('body-parser');
const resourceDetailsRoutes = require('./routes/resourceDetails.routes');

const app = express();

app.use(bodyParser.json());

// Middleware di mock autenticazione per sviluppo/test
app.use((req, res, next) => {
  // Integrazione reale: decodifica JWT o sessione.
  // Per ora, utente admin di default se header X-Demo-Admin=true
  const isAdmin = req.header('X-Demo-Admin') === 'true';
  req.user = {
    id: 1,
    username: 'demo.user',
    role: isAdmin ? 'ADMIN' : 'USER'
  };
  next();
});

app.use(resourceDetailsRoutes);

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: 'Errore interno del server' });
});

module.exports = app;
