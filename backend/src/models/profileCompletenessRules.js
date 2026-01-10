/*
 * Modello di regole di completezza profilo
 * Riutilizzabile per Professionista, Azienda, Collaboratore
 */

"use strict";

/**
 * Ogni regola di completezza è definita per tipo profilo e per categoria logica di campi.
 * All'interno di ciascuna categoria, ogni campo ha un peso relativo, e la categoria a sua volta
 * ha un peso rispetto al totale del profilo.
 *
 * Il calcolo finale è una percentuale (0-100) calcolata in base a:
 * - peso categoria
 * - peso campo all'interno della categoria
 * - completamento booleano dei singoli campi
 *
 * I campi opzionali possono contribuire fino a un certo peso massimo, ma l'indicatore
 * non scende sotto determinate soglie minime se mancano solo campi opzionali.
 */

const PROFILE_TYPES = {
  PROFESSIONISTA: "PROFESSIONISTA",
  AZIENDA: "AZIENDA",
  COLLABORATORE: "COLLABORATORE"
};

/**
 * Definizione delle categorie di completezza per ogni tipo di profilo.
 *
 * Nota: i nomi dei campi devono corrispondere alle proprietà effettive dei modelli
 * esistenti (professionista, azienda, collaboratore). Se necessario, possono essere
 * mappati in uno strato di service.
 */

const completenessRules = {
  [PROFILE_TYPES.PROFESSIONISTA]: {
    categories: [
      {
        key: "anagrafica",
        label: "Anagrafica",
        weight: 0.35,
        fields: [
          { key: "nome", label: "Nome", required: true, weight: 0.25 },
          { key: "cognome", label: "Cognome", required: true, weight: 0.25 },
          { key: "dataNascita", label: "Data di nascita", required: false, weight: 0.15 },
          { key: "codiceFiscale", label: "Codice Fiscale", required: true, weight: 0.35 }
        ]
      },
      {
        key: "contatti",
        label: "Contatti",
        weight: 0.25,
        fields: [
          { key: "email", label: "Email", required: true, weight: 0.4 },
          { key: "telefono", label: "Telefono", required: false, weight: 0.3 },
          { key: "indirizzoResidenza", label: "Indirizzo di residenza", required: false, weight: 0.3 }
        ]
      },
      {
        key: "datiFiscali",
        label: "Dati fiscali per fatturazione",
        weight: 0.25,
        fields: [
          { key: "partitaIva", label: "Partita IVA", required: false, weight: 0.4 },
          { key: "indirizzoFatturazione", label: "Indirizzo di fatturazione", required: false, weight: 0.3 },
          { key: "pec", label: "PEC", required: false, weight: 0.3 }
        ],
        minContributionIfAnyFieldPresent: 0.1
      },
      {
        key: "datiProfessionali",
        label: "Dati professionali per CV",
        weight: 0.15,
        fields: [
          { key: "ruoloPrincipale", label: "Ruolo principale", required: true, weight: 0.4 },
          { key: "competenzePrincipali", label: "Competenze principali", required: false, weight: 0.35 },
          { key: "anniEsperienza", label: "Anni di esperienza", required: false, weight: 0.25 }
        ]
      }
    ],
    minimumRequiredCategoriesCompletion: 0.6
  },
  [PROFILE_TYPES.AZIENDA]: {
    categories: [
      {
        key: "anagrafica",
        label: "Anagrafica aziendale",
        weight: 0.3,
        fields: [
          { key: "ragioneSociale", label: "Ragione sociale", required: true, weight: 0.4 },
          { key: "formaGiuridica", label: "Forma giuridica", required: false, weight: 0.2 },
          { key: "codiceFiscale", label: "Codice Fiscale", required: true, weight: 0.4 }
        ]
      },
      {
        key: "contatti",
        label: "Contatti",
        weight: 0.2,
        fields: [
          { key: "email", label: "Email", required: true, weight: 0.4 },
          { key: "telefono", label: "Telefono", required: true, weight: 0.3 },
          { key: "sitoWeb", label: "Sito web", required: false, weight: 0.3 }
        ]
      },
      {
        key: "datiFiscali",
        label: "Dati fiscali per fatturazione",
        weight: 0.3,
        fields: [
          { key: "partitaIva", label: "Partita IVA", required: true, weight: 0.4 },
          { key: "indirizzoSedeLegale", label: "Indirizzo sede legale", required: true, weight: 0.3 },
          { key: "codiceDestinatario", label: "Codice destinatario SDI", required: false, weight: 0.3 }
        ]
      },
      {
        key: "datiOperativi",
        label: "Dati operativi per OdL",
        weight: 0.2,
        fields: [
          { key: "referenteOperativo", label: "Referente operativo", required: false, weight: 0.4 },
          { key: "emailReferenteOperativo", label: "Email referente operativo", required: false, weight: 0.3 },
          { key: "telefonoReferenteOperativo", label: "Telefono referente operativo", required: false, weight: 0.3 }
        ],
        maxOptionalContribution: 0.15
      }
    ],
    minimumRequiredCategoriesCompletion: 0.65
  },
  [PROFILE_TYPES.COLLABORATORE]: {
    categories: [
      {
        key: "anagrafica",
        label: "Anagrafica collaboratore",
        weight: 0.4,
        fields: [
          { key: "nome", label: "Nome", required: true, weight: 0.25 },
          { key: "cognome", label: "Cognome", required: true, weight: 0.25 },
          { key: "ruolo", label: "Ruolo", required: true, weight: 0.3 },
          { key: "codiceFiscale", label: "Codice Fiscale", required: false, weight: 0.2 }
        ]
      },
      {
        key: "contatti",
        label: "Contatti",
        weight: 0.3,
        fields: [
          { key: "email", label: "Email", required: true, weight: 0.5 },
          { key: "telefono", label: "Telefono", required: false, weight: 0.5 }
        ]
      },
      {
        key: "datiOperativi",
        label: "Dati operativi per OdL",
        weight: 0.3,
        fields: [
          { key: "matricolaInterna", label: "Matricola interna", required: false, weight: 0.3 },
          { key: "centroDiCosto", label: "Centro di costo", required: false, weight: 0.4 },
          { key: "sedeLavoroPrevalente", label: "Sede di lavoro prevalente", required: false, weight: 0.3 }
        ]
      }
    ],
    minimumRequiredCategoriesCompletion: 0.55
  }
};

/**
 * Soglie di traduzione percentuale -> stato semaforo.
 */
const statusThresholds = {
  red: 40, // < 40%
  yellow: 75 // 40% - 74% giallo, >=75% verde
};

function evaluateField(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return true;
  if (typeof value === "boolean") return true;
  if (value instanceof Date) return true;
  // Oggetti generici: consideriamo true se hanno almeno una chiave
  if (typeof value === "object") return Object.keys(value).length > 0;
  return false;
}

function computeCategoryScore(categoryConfig, profileData) {
  let weightedSum = 0;
  let totalFieldWeight = 0;

  for (const field of categoryConfig.fields) {
    const value = profileData[field.key];
    const present = evaluateField(value);
    totalFieldWeight += field.weight;
    if (present) {
      weightedSum += field.weight;
    }
  }

  if (totalFieldWeight === 0) {
    return 0;
  }

  let raw = weightedSum / totalFieldWeight; // 0-1

  // Gestione minimi/massimi opzionali a livello di categoria
  if (categoryConfig.minContributionIfAnyFieldPresent && weightedSum > 0 && raw < categoryConfig.minContributionIfAnyFieldPresent) {
    raw = categoryConfig.minContributionIfAnyFieldPresent;
  }

  if (typeof categoryConfig.maxOptionalContribution === "number") {
    const requiredFieldWeight = categoryConfig.fields.filter(f => f.required).reduce((acc, f) => acc + f.weight, 0);
    const requiredPresentWeight = categoryConfig.fields.filter(f => f.required).reduce((acc, f) => {
      const v = profileData[f.key];
      return acc + (evaluateField(v) ? f.weight : 0);
    }, 0);
    const requiredRatio = requiredFieldWeight > 0 ? requiredPresentWeight / requiredFieldWeight : 1;
    const optionalMax = categoryConfig.maxOptionalContribution;
    if (requiredRatio < 1 && raw > optionalMax) {
      raw = optionalMax;
    }
  }

  return raw;
}

function computeProfileCompleteness(profileType, profileData) {
  const config = completenessRules[profileType];
  if (!config) {
    throw new Error(`Tipo profilo non supportato per completezza: ${profileType}`);
  }

  let total = 0;
  let details = [];

  for (const category of config.categories) {
    const catScore = computeCategoryScore(category, profileData); // 0-1
    const contribution = catScore * category.weight; // peso sul totale
    total += contribution;
    details.push({
      key: category.key,
      label: category.label,
      weight: category.weight,
      score: Math.round(catScore * 100)
    });
  }

  const percentage = Math.round(total * 100);
  let status = "green";
  if (percentage < statusThresholds.red) {
    status = "red";
  } else if (percentage < statusThresholds.yellow) {
    status = "yellow";
  }

  return {
    percentage,
    status,
    categories: details
  };
}

module.exports = {
  PROFILE_TYPES,
  completenessRules,
  computeProfileCompleteness,
  statusThresholds
};
