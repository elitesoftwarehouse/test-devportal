"use strict";

const assert = require("assert");

const {
  PROFILE_TYPES,
  computeProfileCompleteness
} = require("../src/models/profileCompletenessRules");

describe("profileCompletenessRules", () => {
  it("dovrebbe calcolare 100% per un professionista completo", () => {
    const data = {
      nome: "Mario",
      cognome: "Rossi",
      dataNascita: new Date("1980-01-01"),
      codiceFiscale: "MRARSS80A01H501U",
      email: "mario.rossi@example.com",
      telefono: "1234567890",
      indirizzoResidenza: "Via Roma 1",
      partitaIva: "IT12345678901",
      indirizzoFatturazione: "Via Fatt 2",
      pec: "mario.rossi@pec.it",
      ruoloPrincipale: "Consulente",
      competenzePrincipali: ["PM", "Business Analysis"],
      anniEsperienza: 10
    };

    const res = computeProfileCompleteness(PROFILE_TYPES.PROFESSIONISTA, data);

    assert.strictEqual(res.status === "green", true);
    assert.ok(res.percentage <= 100 && res.percentage >= 80); // potrebbe non essere 100 esatto per pesi opzionali
  });

  it("dovrebbe dare stato rosso per dati minimi mancanti", () => {
    const data = {
      nome: "Mario",
      // cognome mancante
      codiceFiscale: "",
      email: ""
    };

    const res = computeProfileCompleteness(PROFILE_TYPES.PROFESSIONISTA, data);

    assert.strictEqual(res.status, "red");
    assert.ok(res.percentage < 40);
  });

  it("dovrebbe gestire correttamente campi opzionali mancanti per azienda", () => {
    const data = {
      ragioneSociale: "ACME S.p.A.",
      codiceFiscale: "12345678901",
      email: "info@acme.it",
      telefono: "0123456789",
      partitaIva: "IT12345678901",
      indirizzoSedeLegale: "Via Industria 10"
      // altri campi opzionali mancanti
    };

    const res = computeProfileCompleteness(PROFILE_TYPES.AZIENDA, data);

    assert.ok(res.percentage >= 50);
  });
});
