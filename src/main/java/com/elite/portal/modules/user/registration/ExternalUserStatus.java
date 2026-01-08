package com.elite.portal.modules.user.registration;

/**
 * Stato di registrazione/accesso per gli utenti esterni.
 * Nei test viene usato per verificare la transizione
 * APPROVED_PENDING_REGISTRATION -> ACTIVE.
 */
public enum ExternalUserStatus {

    /** Utente approvato ma non ha ancora completato la registrazione. */
    APPROVED_PENDING_REGISTRATION,

    /** Utente attivo che ha completato la registrazione. */
    ACTIVE,

    /** Utente bloccato o non autorizzato all'accesso. */
    BLOCKED
}
