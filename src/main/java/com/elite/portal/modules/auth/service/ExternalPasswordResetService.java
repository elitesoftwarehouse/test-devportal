package com.elite.portal.modules.auth.service;

import com.elite.portal.modules.auth.model.PasswordResetToken;
import com.elite.portal.modules.auth.repository.PasswordResetTokenRepository;
import com.elite.portal.modules.user.model.ExternalUser;
import com.elite.portal.modules.user.repository.ExternalUserRepository;
import com.elite.portal.shared.email.EmailService;
import com.elite.portal.shared.logging.AppLogger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class ExternalPasswordResetService {

    private static final int TOKEN_BYTE_LENGTH = 32;

    private final ExternalUserRepository externalUserRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    private final AppLogger logger;
    private final SecureRandom secureRandom;

    @Value("${auth.external.password-reset.token.expiration-minutes:60}")
    private int tokenExpirationMinutes;

    @Value("${auth.external.password-reset.rate-limit.max-requests:5}")
    private int maxRequestsPerWindow;

    @Value("${auth.external.password-reset.rate-limit.window-minutes:60}")
    private int rateLimitWindowMinutes;

    @Value("${auth.external.password-reset.base-url:https://portal/reset-password}")
    private String resetPasswordBaseUrl;

    public ExternalPasswordResetService(ExternalUserRepository externalUserRepository,
                                        PasswordResetTokenRepository passwordResetTokenRepository,
                                        EmailService emailService,
                                        AppLogger logger) {
        this.externalUserRepository = externalUserRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
        this.logger = logger;
        this.secureRandom = new SecureRandom();
    }

    @Transactional
    public void handleForgotPassword(String email) {
        String normalizedEmail = normalizeEmail(email);
        Optional<ExternalUser> userOpt = findActiveExternalUserByEmail(normalizedEmail);

        // Rate limiting per email anche se l'utente non esiste, per evitare enumeration
        boolean rateLimited = isRateLimited(normalizedEmail);
        if (rateLimited) {
            logger.warn("Rate limit raggiunto per richiesta reset password", "email", normalizedEmail);
            // Risposta verso il client rimane generica
            return;
        }

        if (!userOpt.isPresent()) {
            logger.debug("Nessun utente esterno trovato per email fornita in richiesta reset password", "email", normalizedEmail);
            return;
        }

        ExternalUser user = userOpt.get();

        String token = generateSecureToken();
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        LocalDateTime expiresAt = now.plusMinutes(tokenExpirationMinutes);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setEmail(normalizedEmail);
        resetToken.setToken(token);
        resetToken.setCreatedAt(now);
        resetToken.setExpiresAt(expiresAt);
        resetToken.setUsed(false);
        resetToken.setCreatedIp(null);

        passwordResetTokenRepository.save(resetToken);

        String resetLink = buildResetLink(token);
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);
        } catch (Exception ex) {
            logger.error("Errore durante l'invio email di reset password", ex, "email", normalizedEmail);
            // Non propaghiamo l'errore al client per evitare leakage di informazioni
        }
    }

    private Optional<ExternalUser> findActiveExternalUserByEmail(String email) {
        try {
            return externalUserRepository.findByEmailAndActiveTrueAndTypeStandardExternal(email);
        } catch (Exception ex) {
            logger.error("Errore durante la ricerca utente esterno per reset password", ex, "email", email);
            return Optional.empty();
        }
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    private boolean isRateLimited(String email) {
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(rateLimitWindowMinutes);
        List<PasswordResetToken> tokens = passwordResetTokenRepository.findByEmailAndCreatedAtAfter(email, windowStart);
        return tokens.size() >= maxRequestsPerWindow;
    }

    private String generateSecureToken() {
        byte[] randomBytes = new byte[TOKEN_BYTE_LENGTH];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String buildResetLink(String token) {
        StringBuilder sb = new StringBuilder(resetPasswordBaseUrl);
        if (!resetPasswordBaseUrl.contains("?")) {
            sb.append("?token=").append(token);
        } else {
            sb.append("&token=").append(token);
        }
        return sb.toString();
    }
}
