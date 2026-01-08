package com.elite.portal.modules.security.domain;

/**
 * Enum con i codici dei ruoli di sistema supportati.
 */
public enum RoleCode {

    /**
     * Amministratore globale del sistema.
     */
    SYS_ADMIN,

    /**
     * Operatore IT che gestisce la coda richieste di accreditamento.
     */
    IT_OPERATOR,

    /**
     * Utente esterno in attesa di accreditamento/conferma.
     */
    EXTERNAL_USER_PENDING
}
