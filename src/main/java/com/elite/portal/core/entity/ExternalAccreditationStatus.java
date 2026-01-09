package com.elite.portal.core.entity;

/**
 * Stato del ciclo di vita di un soggetto esterno rispetto al processo di accreditamento.
 * 
 * REGISTERED_PENDING_ACCREDITATION: registrato ma non ancora accreditato.
 * IN_REVIEW: la richiesta di accreditamento è in revisione da parte di un IT_OPERATOR.
 * ACCREDITED: soggetto esterno accreditato.
 * REJECTED: richiesta di accreditamento respinta.
 */
public enum ExternalAccreditationStatus {

    REGISTERED_PENDING_ACCREDITATION,

    IN_REVIEW,

    ACCREDITED,

    REJECTED

}
