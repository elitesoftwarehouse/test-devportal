const express = require('express');
const bodyParser = require('body-parser');
const { fornitoriAziendeRouter, sequelize } = require('./api/routes/fornitoriAziende.routes');

const app = express();

app.use(bodyParser.json());

// Middleware di autenticazione fittizio per i test/demo.
// In un progetto reale questo verrebbe sostituito con JWT/SSO ecc.
app.use((req, res, next) => {
  const roleHeader = req.header('x-test-user-role');
  if (roleHeader) {
    req.user = { id: 1, role: roleHeader };
  }
  next();
});

app.use('/api', fornitoriAziendeRouter);

async function initDatabase() {
  await sequelize.sync({ force: true });
}

module.exports = {
  app,
  initDatabase
};
