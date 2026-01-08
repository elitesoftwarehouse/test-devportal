package com.elite.portal.modules.user.registration;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servizio minimale utilizzato nei test per simulare il completamento
 * della registrazione a partire da un token di registrazione.
 */
@Service
public class RegistrationService {

    private final RegistrationTokenRepository registrationTokenRepository;
    private final ExternalUserRepository externalUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    public RegistrationService(RegistrationTokenRepository registrationTokenRepository,
                               ExternalUserRepository externalUserRepository,
                               PasswordEncoder passwordEncoder,
                               Clock clock) {
        this.registrationTokenRepository = registrationTokenRepository;
        this.externalUserRepository = externalUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    /**
     * Completa la registrazione impostando la password, marcando il token come usato
     * e portando l'utente da APPROVED_PENDING_REGISTRATION ad ACTIVE.
     * Le eccezioni lanciate sono utilizzate dai test per validare i casi d'errore.
     *
     * @param tokenValue token di registrazione
     * @param rawPassword password in chiaro da impostare
     */
    @Transactional
    public void completeRegistration(String tokenValue, String rawPassword) {
        if (rawPassword == null || rawPassword.length() < 10) {
            throw new IllegalArgumentException("Password non conforme");
        }

        Optional<RegistrationTokenEntity> optionalToken = registrationTokenRepository.findByToken(tokenValue);
        RegistrationTokenEntity token = optionalToken.orElseThrow(() -> new IllegalArgumentException("Token non valido"));

        Instant now = Instant.now(clock);
        if (token.getExpiresAt().isBefore(now)) {
            throw new IllegalStateException("Token scaduto");
        }

        if (token.getStatus() == RegistrationTokenStatus.USED) {
            throw new IllegalStateException("Token gia' usato");
        }

        ExternalUserEntity user = token.getExternalUser();
        if (user.getStatus() == ExternalUserStatus.ACTIVE) {
            throw new IllegalStateException("Utente gia' attivo");
        }

        String encoded = passwordEncoder.encode(rawPassword);
        user.setPasswordHash(encoded);
        user.setStatus(ExternalUserStatus.ACTIVE);
        user.setUpdatedAt(now);
        externalUserRepository.save(user);

        token.setStatus(RegistrationTokenStatus.USED);
        token.setUpdatedAt(now);
        registrationTokenRepository.save(token);
    }
}
