package com.elite.portal.core.entity;

/**
 * Stato dell'utente per la gestione di abilitazione/disabilitazione login.
 */
public enum UserStatus {

    /**
     * Utente attivo, abilitato al login.
     */
    ACTIVE,

    /**
     * Utente creato ma non ancora attivato (es. accreditamento in corso o primo accesso non completato).
     */
    PENDING,

    /**
     * Utente disabilitato dall'amministrazione.
     */
    DISABLED,

    /**
     * Utente bloccato per motivi di sicurezza o policy.
     */
    BLOCKED

}
