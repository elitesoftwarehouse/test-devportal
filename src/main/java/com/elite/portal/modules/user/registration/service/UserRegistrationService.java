package com.elite.portal.modules.user.registration.service;

import com.elite.portal.modules.notification.service.EmailVerificationService;
import com.elite.portal.modules.user.registration.model.RegistrationRequest;
import com.elite.portal.modules.user.registration.model.RegistrationResult;
import com.elite.portal.modules.user.repository.UserRepository;
import com.elite.portal.modules.user.model.User;
import com.elite.portal.modules.user.verification.EmailVerificationTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class UserRegistrationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserRegistrationService.class);

    private final UserRepository userRepository;
    private final EmailVerificationTokenService emailVerificationTokenService;
    private final EmailVerificationService emailVerificationService;

    public UserRegistrationService(UserRepository userRepository,
                                   EmailVerificationTokenService emailVerificationTokenService,
                                   EmailVerificationService emailVerificationService) {
        this.userRepository = userRepository;
        this.emailVerificationTokenService = emailVerificationTokenService;
        this.emailVerificationService = emailVerificationService;
    }

    @Transactional
    public RegistrationResult registerExternalUser(RegistrationRequest request, Locale locale) {
        // Creazione utente in stato non verificato
        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setVerified(false);
        // Altre proprietà e validazioni coerenti con la logica esistente

        user = userRepository.save(user);

        // Generazione token di verifica associato all'utente
        String token = emailVerificationTokenService.createTokenForUser(user.getId());

        // Invio email di verifica (errori loggati ma non bloccanti)
        try {
            String displayName = buildDisplayName(user);
            emailVerificationService.sendVerificationEmail(user.getEmail(), displayName, token, locale);
        } catch (RuntimeException ex) {
            // Non si espongono dati sensibili nei log
            LOGGER.error("Errore non critico durante l'invio dell'email di verifica per utente id={}.", user.getId(), ex);
        }

        RegistrationResult result = new RegistrationResult();
        result.setUserId(user.getId());
        result.setEmailVerificationRequired(true);
        return result;
    }

    private String buildDisplayName(User user) {
        if (user.getFirstName() == null && user.getLastName() == null) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        if (user.getFirstName() != null) {
            sb.append(user.getFirstName());
        }
        if (user.getLastName() != null) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(user.getLastName());
        }
        return sb.toString();
    }
}
