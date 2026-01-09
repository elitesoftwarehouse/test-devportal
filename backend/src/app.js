"use strict";

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

// Altri router esistenti qui...

const profileCompletenessRoutes = require("./routes/profileCompletenessRoutes");
app.use(profileCompletenessRoutes);

// Gestione errori semplice
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: "Errore interno del server" });
});

module.exports = app;
