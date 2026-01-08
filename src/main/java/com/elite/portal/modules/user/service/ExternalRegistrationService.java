package com.elite.portal.modules.user.service;

/**
 * Servizio applicativo per la gestione del flusso di completamento
 * registrazione degli utenti esterni.
 * <p>
 * L'implementazione concreta deve occuparsi di:
 * <ul>
 *   <li>Validare il token di registrazione</li>
 *   <li>Verificare che l'utente non sia già registrato</li>
 *   <li>Applicare le policy di sicurezza password</li>
 *   <li>Persistenza della password e attivazione dell'account</li>
 * </ul>
 */
public interface ExternalRegistrationService {

    /**
     * Valida il token di registrazione e fornisce le informazioni essenziali
     * per la UI.
     *
     * @param token token di registrazione
     * @return risultato della validazione
     */
    TokenValidationResult validateRegistrationToken(String token);

    /**
     * Completa la registrazione dell'utente associato al token impostando
     * la password e attivando l'account.
     *
     * @param token    token di registrazione
     * @param password password scelta dall'utente
     * @throws IllegalArgumentException se il token non è valido
     * @throws IllegalStateException    se l'utente risulta già registrato
     */
    void completeRegistration(String token, String password);

    /**
     * Restituisce il pattern regex utilizzato per la validazione client-side
     * della password.
     *
     * @return pattern regex come stringa
     */
    String getPasswordPattern();

    /**
     * Restituisce la lunghezza minima richiesta per la password.
     *
     * @return lunghezza minima
     */
    int getPasswordMinLength();

    /**
     * Restituisce la lunghezza massima consentita per la password.
     *
     * @return lunghezza massima
     */
    int getPasswordMaxLength();
}
