package com.elite.portal.core.entity;

/**
 * Stato dell'utente nel ciclo di vita dell'identità applicativa.
 */
public enum UserStatus {

    /** L'utente esterno è stato approvato ma deve ancora completare la registrazione (impostare la password). */
    APPROVED_PENDING_REGISTRATION,

    /** L'utente è attivo e può accedere al portale. */
    ACTIVE,

    /** Altri stati possibili (placeholder per integrazione con il modello esistente). */
    INACTIVE,
    SUSPENDED
}
