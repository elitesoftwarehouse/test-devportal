package com.elite.portal.modules.user.auth.dto;

/**
 * Codici di errore standardizzati per il completamento registrazione esterna.
 */
public enum ExternalRegistrationErrorCode {

    TOKEN_INVALIDO,
    TOKEN_SCADUTO,
    TOKEN_GIA_UTILIZZATO,
    UTENTE_NON_TROVATO,
    PASSWORD_NON_VALIDA
}
