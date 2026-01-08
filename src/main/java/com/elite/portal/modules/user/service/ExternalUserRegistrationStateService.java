package com.elite.portal.modules.user.service;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elite.portal.modules.user.entity.ExternalUser;
import com.elite.portal.modules.user.entity.ExternalUserStatus;
import com.elite.portal.modules.user.repository.ExternalUserRepository;

/**
 * Servizio applicativo che incapsula le regole di stato legate alla registrazione
 * iniziale dei collaboratori esterni approvati.
 *
 * <p>Responsabilità principali:
 * <ul>
 *     <li>Generazione del token di registrazione e passaggio in stato APPROVED_PENDING_REGISTRATION.</li>
 *     <li>Validazione del token e transizione a ACTIVE al completamento della registrazione.</li>
 *     <li>Gestione del flag firstLoginCompleted.</li>
 * </ul>
 */
@Service
public class ExternalUserRegistrationStateService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExternalUserRegistrationStateService.class);

    private final ExternalUserRepository externalUserRepository;
    private final Clock clock;
    private final RegistrationTokenGenerator registrationTokenGenerator;

    public ExternalUserRegistrationStateService(ExternalUserRepository externalUserRepository,
                                                Clock clock,
                                                RegistrationTokenGenerator registrationTokenGenerator) {
        this.externalUserRepository = externalUserRepository;
        this.clock = clock;
        this.registrationTokenGenerator = registrationTokenGenerator;
    }

    /**
     * Passa l'utente in stato APPROVED_PENDING_REGISTRATION generando un token di registrazione monouso
     * con relativa scadenza.
     *
     * @param user utente appena approvato da IT_OPERATOR
     * @param tokenTtlHours durata di validità del token in ore
     * @return utente aggiornato e persistito
     */
    @Transactional
    public ExternalUser markApprovedPendingRegistration(ExternalUser user, int tokenTtlHours) {
        if (!ExternalUserStatus.PENDING_APPROVAL.equals(user.getStatus())) {
            throw new IllegalStateException("Lo stato " + user.getStatus() + " non consente l'approvazione");
        }
        String token = registrationTokenGenerator.generateToken();
        Instant now = Instant.now(clock);
        Instant expiresAt = now.plus(tokenTtlHours, ChronoUnit.HOURS);

        user.setStatus(ExternalUserStatus.APPROVED_PENDING_REGISTRATION);
        user.setRegistrationToken(token);
        user.setRegistrationTokenExpiresAt(expiresAt);
        user.setRegistrationCompletedAt(null);
        user.setFirstLoginCompleted(false);

        ExternalUser saved = externalUserRepository.save(user);
        LOGGER.info("Impostato stato APPROVED_PENDING_REGISTRATION per externalUserId={} con scadenza token {}", saved.getId(), expiresAt);
        return saved;
    }

    /**
     * Valida il token di registrazione e, se valido, marca la registrazione come completata
     * transitando lo stato da APPROVED_PENDING_REGISTRATION a ACTIVE.
     *
     * @param token token di registrazione monouso ricevuto dall'utente
     * @return utente aggiornato se il token è valido
     * @throws IllegalArgumentException se il token non è presente o è scaduto
     * @throws IllegalStateException    se lo stato dell'utente non consente il completamento
     */
    @Transactional
    public ExternalUser completeRegistrationWithToken(String token) {
        if (token == null || token.isEmpty()) {
            throw new IllegalArgumentException("Token di registrazione mancante");
        }

        Optional<ExternalUser> userOpt = externalUserRepository.findByRegistrationToken(token);
        if (!userOpt.isPresent()) {
            throw new IllegalArgumentException("Token di registrazione non valido");
        }

        ExternalUser user = userOpt.get();
        Instant now = Instant.now(clock);
        Instant expiresAt = user.getRegistrationTokenExpiresAt();
        if (expiresAt != null && now.isAfter(expiresAt)) {
            LOGGER.warn("Token di registrazione scaduto per externalUserId={}", user.getId());
            throw new IllegalArgumentException("Token di registrazione scaduto");
        }

        user.markRegistrationCompleted(now);
        ExternalUser saved = externalUserRepository.save(user);
        LOGGER.info("Registrazione completata per externalUserId={} -> stato {}", saved.getId(), saved.getStatus());
        return saved;
    }

    /**
     * Marca il completamento del primo login per un utente esterno.
     *
     * @param userId identificativo dell'utente esterno
     * @return utente aggiornato
     * @throws IllegalArgumentException se l'utente non esiste
     */
    @Transactional
    public ExternalUser markFirstLoginCompleted(Long userId) {
        ExternalUser user = externalUserRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Utente esterno non trovato: " + userId));
        user.markFirstLoginCompleted();
        ExternalUser saved = externalUserRepository.save(user);
        LOGGER.info("Primo login completato per externalUserId={}", saved.getId());
        return saved;
    }
}
