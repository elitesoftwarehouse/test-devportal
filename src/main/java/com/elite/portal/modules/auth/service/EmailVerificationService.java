package com.elite.portal.modules.auth.service;

import com.elite.portal.modules.auth.dto.EmailVerificationResponseDto;
import com.elite.portal.modules.auth.exception.EmailVerificationException;
import com.elite.portal.modules.auth.model.ExternalUser;
import com.elite.portal.modules.auth.repository.ExternalUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class EmailVerificationService {

    private final ExternalUserRepository externalUserRepository;

    public EmailVerificationService(ExternalUserRepository externalUserRepository) {
        this.externalUserRepository = externalUserRepository;
    }

    @Transactional
    public EmailVerificationResponseDto verifyEmail(String token) {
        if (token == null || token.trim().isEmpty()) {
            throw new EmailVerificationException("EMAIL_VERIFICATION_TOKEN_MISSING", "Token di verifica mancante.");
        }

        ExternalUser user = externalUserRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new EmailVerificationException("EMAIL_VERIFICATION_TOKEN_INVALID", "Token di verifica non valido."));

        if (user.isEmailVerified()) {
            return new EmailVerificationResponseDto(true, "EMAIL_ALREADY_VERIFIED", "L'indirizzo email risulta già verificato.", true);
        }

        LocalDateTime expiry = user.getEmailVerificationTokenExpiry();
        if (expiry == null || expiry.isBefore(LocalDateTime.now())) {
            throw new EmailVerificationException("EMAIL_VERIFICATION_TOKEN_EXPIRED", "Il token di verifica è scaduto.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        externalUserRepository.save(user);

        return new EmailVerificationResponseDto(true, "EMAIL_VERIFICATION_SUCCESS", "Email verificata con successo.", false);
    }
}
