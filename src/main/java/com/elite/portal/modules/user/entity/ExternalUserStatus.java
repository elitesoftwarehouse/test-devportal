package com.elite.portal.modules.user.entity;

import java.util.Arrays;
import java.util.List;

/**
 * Stato applicativo degli utenti esterni nel flusso di accreditamento e utilizzo del portale.
 *
 * <p>Significato principali stati:
 * <ul>
 *     <li>DRAFT: anagrafica creata ma flusso di accreditamento non ancora avviato.</li>
 *     <li>PENDING_APPROVAL: richiesta di accreditamento inviata e in attesa di valutazione IT.</li>
 *     <li>REJECTED: richiesta di accreditamento rifiutata da IT_OPERATOR.</li>
 *     <li>APPROVED_PENDING_REGISTRATION: richiesta approvata, utente deve ancora completare la registrazione
 *         iniziale creando la password tramite token di registrazione.</li>
 *     <li>ACTIVE: utente ha completato la registrazione e può accedere al portale secondo i ruoli assegnati.</li>
 *     <li>SUSPENDED: accesso temporaneamente sospeso dall'IT.</li>
 *     <li>DEACTIVATED: account dismesso in modo permanente.</li>
 * </ul>
 *
 * <p>Transizione rilevante per questa story:
 * <pre>
 *     PENDING_APPROVAL --(IT_OPERATOR approva)--> APPROVED_PENDING_REGISTRATION
 *     APPROVED_PENDING_REGISTRATION --(completamento registrazione)--> ACTIVE
 * </pre>
 */
public enum ExternalUserStatus {

    DRAFT,
    PENDING_APPROVAL,
    REJECTED,

    /**
     * Richiesta approvata ma registrazione non ancora completata.
     * In questo stato l'utente non ha ancora una password valida e può solo utilizzare
     * il token di registrazione monouso per impostarla.
     */
    APPROVED_PENDING_REGISTRATION,

    /**
     * Utente completamente registrato e abilitato all'accesso.
     */
    ACTIVE,

    SUSPENDED,
    DEACTIVATED;

    /**
     * Restituisce tutti gli stati considerati "attivi" ai fini dell'accesso applicativo.
     * In questa definizione APPROVED_PENDING_REGISTRATION è esplicitamente escluso
     * perché l'utente non ha ancora completato il setup delle credenziali.
     *
     * @return lista degli stati considerati attivi
     */
    public static List<ExternalUserStatus> getLoginEnabledStatuses() {
        return Arrays.asList(ACTIVE);
    }
}
