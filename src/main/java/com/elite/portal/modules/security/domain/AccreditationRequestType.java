package com.elite.portal.modules.security.domain;

/**
 * Tipologia di richiesta di accreditamento.
 */
public enum AccreditationRequestType {

    /**
     * Richiesta di primo accesso al portale.
     */
    NEW_ACCESS,

    /**
     * Richiesta di estensione/variazione dei permessi esistenti.
     */
    PERMISSION_EXTENSION
}
