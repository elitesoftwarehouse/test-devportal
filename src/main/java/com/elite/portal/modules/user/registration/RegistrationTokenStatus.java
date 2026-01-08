package com.elite.portal.modules.user.registration;

/**
 * Stato logico del token di registrazione usato nei test per validare
 * i diversi scenari del flusso di completamento registrazione.
 */
public enum RegistrationTokenStatus {

    /** Token valido e non usato. */
    VALID,

    /** Token scaduto rispetto alla data di scadenza configurata. */
    EXPIRED,

    /** Token inesistente nel sistema. */
    NOT_FOUND,

    /** Token già usato in una precedente registrazione. */
    USED
}
