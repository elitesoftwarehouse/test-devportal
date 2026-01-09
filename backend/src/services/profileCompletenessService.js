"use strict";

const { PROFILE_TYPES, computeProfileCompleteness } = require("../models/profileCompletenessRules");

/**
 * Service per il calcolo degli indicatori di completezza a partire
 * dai modelli esistenti (Professionista, Azienda, Collaboratore).
 *
 * Questo layer gestisce il mapping tra attributi DB e nomi logici
 * utilizzati dalle regole di completezza.
 */

function mapProfessionistaToCompletenessModel(professionista) {
  if (!professionista) return {};
  return {
    nome: professionista.nome,
    cognome: professionista.cognome,
    dataNascita: professionista.data_nascita,
    codiceFiscale: professionista.codice_fiscale,
    email: professionista.email,
    telefono: professionista.telefono,
    indirizzoResidenza: professionista.indirizzo_residenza,
    partitaIva: professionista.partita_iva,
    indirizzoFatturazione: professionista.indirizzo_fatturazione,
    pec: professionista.pec,
    ruoloPrincipale: professionista.ruolo_principale,
    competenzePrincipali: professionista.competenze_principali,
    anniEsperienza: professionista.anni_esperienza
  };
}

function mapAziendaToCompletenessModel(azienda) {
  if (!azienda) return {};
  return {
    ragioneSociale: azienda.ragione_sociale,
    formaGiuridica: azienda.forma_giuridica,
    codiceFiscale: azienda.codice_fiscale,
    email: azienda.email,
    telefono: azienda.telefono,
    sitoWeb: azienda.sito_web,
    partitaIva: azienda.partita_iva,
    indirizzoSedeLegale: azienda.indirizzo_sede_legale,
    codiceDestinatario: azienda.codice_destinatario,
    referenteOperativo: azienda.referente_operativo,
    emailReferenteOperativo: azienda.email_referente_operativo,
    telefonoReferenteOperativo: azienda.telefono_referente_operativo
  };
}

function mapCollaboratoreToCompletenessModel(collaboratore) {
  if (!collaboratore) return {};
  return {
    nome: collaboratore.nome,
    cognome: collaboratore.cognome,
    ruolo: collaboratore.ruolo,
    codiceFiscale: collaboratore.codice_fiscale,
    email: collaboratore.email,
    telefono: collaboratore.telefono,
    matricolaInterna: collaboratore.matricola_interna,
    centroDiCosto: collaboratore.centro_di_costo,
    sedeLavoroPrevalente: collaboratore.sede_lavoro_prevalente
  };
}

async function calculateCompletenessForProfessionista(professionista) {
  const mapped = mapProfessionistaToCompletenessModel(professionista);
  const result = computeProfileCompleteness(PROFILE_TYPES.PROFESSIONISTA, mapped);
  return result;
}

async function calculateCompletenessForAzienda(azienda) {
  const mapped = mapAziendaToCompletenessModel(azienda);
  const result = computeProfileCompleteness(PROFILE_TYPES.AZIENDA, mapped);
  return result;
}

async function calculateCompletenessForCollaboratore(collaboratore) {
  const mapped = mapCollaboratoreToCompletenessModel(collaboratore);
  const result = computeProfileCompleteness(PROFILE_TYPES.COLLABORATORE, mapped);
  return result;
}

module.exports = {
  calculateCompletenessForProfessionista,
  calculateCompletenessForAzienda,
  calculateCompletenessForCollaboratore
};
