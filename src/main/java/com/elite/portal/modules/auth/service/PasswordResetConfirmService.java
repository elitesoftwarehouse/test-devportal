package com.elite.portal.modules.auth.service;

import com.elite.portal.modules.auth.domain.PasswordResetToken;
import com.elite.portal.modules.auth.dto.PasswordResetConfirmRequestDto;
import com.elite.portal.modules.auth.dto.PasswordResetConfirmResponseDto;
import com.elite.portal.modules.auth.repository.PasswordResetTokenRepository;
import com.elite.portal.modules.user.domain.ExternalUser;
import com.elite.portal.modules.user.repository.ExternalUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PasswordResetConfirmService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PasswordResetConfirmService.class);

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final ExternalUserRepository externalUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicyService passwordPolicyService;
    private final SessionInvalidationService sessionInvalidationService;

    public PasswordResetConfirmService(PasswordResetTokenRepository passwordResetTokenRepository,
                                       ExternalUserRepository externalUserRepository,
                                       PasswordEncoder passwordEncoder,
                                       PasswordPolicyService passwordPolicyService,
                                       SessionInvalidationService sessionInvalidationService) {
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.externalUserRepository = externalUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordPolicyService = passwordPolicyService;
        this.sessionInvalidationService = sessionInvalidationService;
    }

    @Transactional
    public PasswordResetConfirmResponseDto resetPassword(PasswordResetConfirmRequestDto requestDto) {
        String tokenValue = requestDto.getToken();
        String newPassword = requestDto.getNewPassword();

        Optional<PasswordResetToken> optionalToken = passwordResetTokenRepository.findByToken(tokenValue);
        if (!optionalToken.isPresent()) {
            LOGGER.warn("Tentativo di reset password con token non valido");
            return new PasswordResetConfirmResponseDto(false, "Impossibile completare il reset della password.");
        }

        PasswordResetToken token = optionalToken.get();
        LocalDateTime now = LocalDateTime.now();

        if (token.isUsed() || token.isExpired(now)) {
            LOGGER.warn("Tentativo di reset password con token usato o scaduto, tokenId={}", token.getId());
            return new PasswordResetConfirmResponseDto(false, "Impossibile completare il reset della password.");
        }

        ExternalUser user = token.getExternalUser();
        if (user == null || !user.isActive()) {
            LOGGER.warn("Tentativo di reset password per utente esterno non valido o non attivo, tokenId={}", token.getId());
            return new PasswordResetConfirmResponseDto(false, "Impossibile completare il reset della password.");
        }

        if (!passwordPolicyService.isValid(newPassword)) {
            LOGGER.info("Nuova password non conforme alla policy per utente esterno id={}", user.getId());
            return new PasswordResetConfirmResponseDto(false, passwordPolicyService.getValidationMessage());
        }

        // TODO: se previsto a sistema, verificare il riutilizzo di password recenti.

        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        externalUserRepository.save(user);

        token.setUsedAt(now);
        passwordResetTokenRepository.save(token);

        sessionInvalidationService.invalidateSessionsForUser(user);

        LOGGER.info("Reset password completato con successo per utente esterno id={}", user.getId());
        return new PasswordResetConfirmResponseDto(true, "La password è stata aggiornata correttamente.");
    }
}
