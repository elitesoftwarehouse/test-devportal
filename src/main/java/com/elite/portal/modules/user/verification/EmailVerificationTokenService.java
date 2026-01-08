package com.elite.portal.modules.user.verification;

import com.elite.portal.modules.notification.config.EmailVerificationProperties;
import com.elite.portal.modules.user.verification.entity.EmailVerificationToken;
import com.elite.portal.modules.user.verification.repository.EmailVerificationTokenRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class EmailVerificationTokenService {

    private final EmailVerificationTokenRepository repository;
    private final EmailVerificationProperties properties;

    public EmailVerificationTokenService(EmailVerificationTokenRepository repository,
                                         EmailVerificationProperties properties) {
        this.repository = repository;
        this.properties = properties;
    }

    public String createTokenForUser(Long userId) {
        String token = UUID.randomUUID().toString();
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime expiry = now.plusMinutes(properties.getTokenValidityMinutes());

        EmailVerificationToken entity = new EmailVerificationToken();
        entity.setUserId(userId);
        entity.setToken(token);
        entity.setCreatedAt(now);
        entity.setExpiresAt(expiry);
        entity.setUsed(false);

        repository.save(entity);
        return token;
    }
}
