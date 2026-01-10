/*
 * Modulo di calcolo della completezza dei profili
 * Segue le convenzioni esistenti del progetto (ES modules, servizi puri)
 */

/**
 * Livelli di completezza possibili
 * - ALTA
 * - MEDIA
 * - BASSA
 */
export const COMPLETENESS_LEVEL = {
  HIGH: 'ALTA',
  MEDIUM: 'MEDIA',
  LOW: 'BASSA'
};

/**
 * Regole di completezza per i diversi tipi di profilo.
 * Le regole sono intenzionalmente semplici ma estendibili.
 *
 * Ogni regola definisce:
 * - requiredFields: campi obbligatori con peso
 * - optionalFields: campi opzionali con peso (contribuiscono alla percentuale ma non alla lista "missing")
 */
export const PROFILE_COMPLETENESS_RULES = {
  PROFESSIONISTA: {
    requiredFields: {
      firstName: 2,
      lastName: 2,
      email: 2,
      role: 1,
      skills: 1
    },
    optionalFields: {
      phone: 1,
      address: 1,
      linkedinUrl: 1
    }
  },
  AZIENDA: {
    requiredFields: {
      name: 3,
      vatNumber: 3,
      legalAddress: 2
    },
    optionalFields: {
      website: 1,
      industry: 1
    }
  },
  COLLABORATORE: {
    requiredFields: {
      firstName: 2,
      lastName: 2,
      email: 2
    },
    optionalFields: {
      phone: 1
    }
  }
};

/**
 * Calcola la completezza di un profilo in base alle regole di business.
 *
 * @param {Object} profile - Oggetto profilo (flattened) già normalizzato
 * @param {('PROFESSIONISTA'|'AZIENDA'|'COLLABORATORE')} profileType
 * @returns {{percentage: number, level: string, missingKeyFields: string[]}}
 */
export function calculateProfileCompleteness(profile, profileType) {
  const rules = PROFILE_COMPLETENESS_RULES[profileType];
  if (!rules) {
    return {
      percentage: 0,
      level: COMPLETENESS_LEVEL.LOW,
      missingKeyFields: []
    };
  }

  const { requiredFields, optionalFields } = rules;
  const requiredKeys = Object.keys(requiredFields);
  const optionalKeys = Object.keys(optionalFields || {});

  const totalRequiredWeight = requiredKeys.reduce(
    (acc, key) => acc + (requiredFields[key] || 0),
    0
  );
  const totalOptionalWeight = optionalKeys.reduce(
    (acc, key) => acc + (optionalFields[key] || 0),
    0
  );

  let achievedWeight = 0;
  const missingKeyFields = [];

  // Valutazione campi obbligatori (contribuiscono anche alla lista missing)
  for (const key of requiredKeys) {
    const weight = requiredFields[key] || 0;
    const value = profile[key];
    if (value === null || value === undefined || value === '') {
      missingKeyFields.push(key);
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        achievedWeight += weight;
      } else {
        missingKeyFields.push(key);
      }
    } else {
      achievedWeight += weight;
    }
  }

  // Valutazione campi opzionali (contribuiscono solo alla percentuale)
  for (const key of optionalKeys) {
    const weight = optionalFields[key] || 0;
    const value = profile[key];
    if (value === null || value === undefined || value === '') {
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length > 0) {
        achievedWeight += weight;
      }
    } else {
      achievedWeight += weight;
    }
  }

  const totalWeight = totalRequiredWeight + totalOptionalWeight;
  const percentage = totalWeight === 0 ? 0 : Math.round((achievedWeight / totalWeight) * 100);

  let level;
  if (percentage >= 80) {
    level = COMPLETENESS_LEVEL.HIGH;
  } else if (percentage >= 50) {
    level = COMPLETENESS_LEVEL.MEDIUM;
  } else {
    level = COMPLETENESS_LEVEL.LOW;
  }

  return {
    percentage,
    level,
    missingKeyFields
  };
}

/**
 * Applica il calcolo di completezza a un profilo "grezzo" del dominio,
 * delegando la normalizzazione alla logica specifica per tipo.
 *
 * Questo wrapper rimane semplice per favorire il testing unitario.
 */
export function enrichProfileWithCompleteness(domainProfile) {
  if (!domainProfile || !domainProfile.type) {
    return {
      profile: domainProfile,
      completeness: {
        percentage: 0,
        level: COMPLETENESS_LEVEL.LOW,
        missingKeyFields: []
      }
    };
  }

  const profileType = domainProfile.type;

  // Normalizzazione minimale, ipotizzando che il dominio usi nomi coerenti
  const flatProfile = { ...domainProfile };

  const completeness = calculateProfileCompleteness(flatProfile, profileType);
  return {
    profile: domainProfile,
    completeness
  };
}
