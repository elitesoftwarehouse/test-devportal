package com.elite.portal.modules.user.entity;

/**
 * Tipologia di utente esterno per distinguere tra proprietario e collaboratore.
 */
public enum ExternalUserType {

    /**
     * Proprietario dell'account esterno (es. responsabile azienda fornitrice).
     */
    EXTERNAL_OWNER,

    /**
     * Collaboratore esterno invitato dal proprietario.
     */
    EXTERNAL_COLLABORATOR

}
