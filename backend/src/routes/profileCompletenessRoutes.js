"use strict";

const express = require("express");
const router = express.Router();

const {
  calculateCompletenessForProfessionista,
  calculateCompletenessForAzienda,
  calculateCompletenessForCollaboratore
} = require("../services/profileCompletenessService");

// NOTA: Si assume che esistano i model/DAO Professionista, Azienda, Collaboratore
// e che espongano un metodo findById. Qui usiamo require lazy per evitare errori
// se i file hanno nomi leggermente diversi; adattare ai nomi effettivi nel progetto.

const Professionista = require("../models/Professionista");
const Azienda = require("../models/Azienda");
const Collaboratore = require("../models/Collaboratore");

// GET /api/profili/:tipo/:id/completezza
router.get("/api/profili/:tipo/:id/completezza", async (req, res, next) => {
  try {
    const { tipo, id } = req.params;
    const lower = String(tipo).toLowerCase();

    let entity = null;
    let result = null;

    if (lower === "professionista") {
      entity = await Professionista.findById(id);
      if (!entity) return res.status(404).json({ error: "Professionista non trovato" });
      result = await calculateCompletenessForProfessionista(entity);
    } else if (lower === "azienda") {
      entity = await Azienda.findById(id);
      if (!entity) return res.status(404).json({ error: "Azienda non trovata" });
      result = await calculateCompletenessForAzienda(entity);
    } else if (lower === "collaboratore") {
      entity = await Collaboratore.findById(id);
      if (!entity) return res.status(404).json({ error: "Collaboratore non trovato" });
      result = await calculateCompletenessForCollaboratore(entity);
    } else {
      return res.status(400).json({ error: "Tipo profilo non valido" });
    }

    res.json({
      profileId: id,
      profileType: lower,
      completeness: result
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
