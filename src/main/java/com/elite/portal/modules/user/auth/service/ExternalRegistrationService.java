package com.elite.portal.modules.user.auth.service;

import com.elite.portal.core.entity.User;
import com.elite.portal.core.entity.UserStatus;
import com.elite.portal.core.repository.UserRepository;
import com.elite.portal.modules.user.auth.dto.ExternalCompleteRegistrationRequest;
import com.elite.portal.modules.user.auth.dto.ExternalCompleteRegistrationResponse;
import com.elite.portal.modules.user.auth.dto.ExternalRegistrationErrorCode;
import com.elite.portal.modules.user.auth.entity.RegistrationToken;
import com.elite.portal.modules.user.auth.repository.RegistrationTokenRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * Servizio per la gestione del completamento registrazione degli utenti esterni.
 */
@Service
public class ExternalRegistrationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExternalRegistrationService.class);

    private final RegistrationTokenRepository registrationTokenRepository;
    private final UserRepository userRepository;
    private final PasswordPolicyValidator passwordPolicyValidator;
    private final PasswordEncoder passwordEncoder;

    public ExternalRegistrationService(RegistrationTokenRepository registrationTokenRepository,
                                       UserRepository userRepository,
                                       PasswordPolicyValidator passwordPolicyValidator) {
        this.registrationTokenRepository = registrationTokenRepository;
        this.userRepository = userRepository;
        this.passwordPolicyValidator = passwordPolicyValidator;
        // In un progetto reale è consigliato configurare il PasswordEncoder tramite @Bean.
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /**
     * Completa la registrazione di un collaboratore esterno a partire da token e nuova password.
     * L'operazione è idempotente rispetto al token: un token già utilizzato non consente nuove registrazioni.
     *
     * @param request richiesta contenente token e password
     * @return risposta standardizzata con esito e codice errore in caso di fallimento
     */
    @Transactional
    public ExternalCompleteRegistrationResponse completeRegistration(ExternalCompleteRegistrationRequest request) {
        String tokenValue = request.getToken();
        String rawPassword = request.getPassword();

        LOGGER.info("Richiesta di completamento registrazione esterna ricevuta per token={}", tokenValue);

        Optional<RegistrationToken> tokenOpt = registrationTokenRepository.findByToken(tokenValue);
        if (!tokenOpt.isPresent()) {
            LOGGER.warn("Tentativo di utilizzo di token di registrazione inesistente: {}", tokenValue);
            return ExternalCompleteRegistrationResponse.failure(
                    ExternalRegistrationErrorCode.TOKEN_INVALIDO,
                    "Token di registrazione non valido o inesistente");
        }

        RegistrationToken registrationToken = tokenOpt.get();

        if (registrationToken.isUsed()) {
            LOGGER.warn("Tentativo di riutilizzo di token di registrazione già utilizzato: {}", tokenValue);
            return ExternalCompleteRegistrationResponse.failure(
                    ExternalRegistrationErrorCode.TOKEN_GIA_UTILIZZATO,
                    "Il token di registrazione è già stato utilizzato");
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (registrationToken.getExpiresAt() != null && now.isAfter(registrationToken.getExpiresAt())) {
            LOGGER.warn("Tentativo di utilizzo di token di registrazione scaduto: {}", tokenValue);
            return ExternalCompleteRegistrationResponse.failure(
                    ExternalRegistrationErrorCode.TOKEN_SCADUTO,
                    "Il token di registrazione è scaduto");
        }

        User user = registrationToken.getUser();
        if (user == null) {
            LOGGER.error("Token di registrazione senza utente associato, tokenId={}", registrationToken.getId());
            return ExternalCompleteRegistrationResponse.failure(
                    ExternalRegistrationErrorCode.UTENTE_NON_TROVATO,
                    "Utente associato al token non trovato");
        }

        if (user.getStatus() != UserStatus.APPROVED_PENDING_REGISTRATION) {
            LOGGER.warn("Stato utente non valido per completamento registrazione, userId={}, status={}",
                    user.getId(), user.getStatus());
            return ExternalCompleteRegistrationResponse.failure(
                    ExternalRegistrationErrorCode.TOKEN_INVALIDO,
                    "Il token non è più valido per il completamento della registrazione");
        }

        if (!passwordPolicyValidator.isPasswordValid(rawPassword)) {
            LOGGER.warn("Password non conforme alla policy per userId={}", user.getId());
            return ExternalCompleteRegistrationResponse.failure(
                    ExternalRegistrationErrorCode.PASSWORD_NON_VALIDA,
                    "La password non rispetta la policy di sicurezza");
        }

        String encodedPassword = passwordEncoder.encode(rawPassword);
        user.setPasswordHash(encodedPassword);
        user.setStatus(UserStatus.ACTIVE);
        user.setRegistrationCompletedAt(now);

        registrationToken.setUsed(true);
        registrationToken.setUsedAt(now);

        userRepository.save(user);
        registrationTokenRepository.save(registrationToken);

        LOGGER.info("Registrazione esterna completata con successo per userId={} tramite token={}",
                user.getId(), tokenValue);

        return ExternalCompleteRegistrationResponse.success();
    }
}
