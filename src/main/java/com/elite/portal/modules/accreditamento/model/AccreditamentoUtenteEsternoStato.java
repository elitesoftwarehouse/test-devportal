package com.elite.portal.modules.accreditamento.model;

import java.util.Arrays;

/**
 * Stato della richiesta di accreditamento utente esterno.
 *
 * BOZZA: richiesta salvata ma non ancora inviata
 * INVIATA: richiesta formalmente inviata dal richiedente
 * IN_REVISIONE: richiesta presa in carico da un operatore
 * APPROVATA: richiesta approvata, eventuale utente/azienda creati o collegati
 * RIFIUTATA: richiesta respinta
 */
public enum AccreditamentoUtenteEsternoStato {

    BOZZA,
    INVIATA,
    IN_REVISIONE,
    APPROVATA,
    RIFIUTATA;

    public static AccreditamentoUtenteEsternoStato fromString(String value) {
        if (value == null) {
            return null;
        }
        return Arrays.stream(values())
                .filter(v -> v.name().equalsIgnoreCase(value))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Stato di accreditamento non valido: " + value));
    }
}
