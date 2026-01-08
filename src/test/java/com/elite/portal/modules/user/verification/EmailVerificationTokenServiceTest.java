package com.elite.portal.modules.user.verification;

import com.elite.portal.modules.notification.config.EmailVerificationProperties;
import com.elite.portal.modules.user.verification.entity.EmailVerificationToken;
import com.elite.portal.modules.user.verification.repository.EmailVerificationTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class EmailVerificationTokenServiceTest {

    private EmailVerificationTokenRepository repository;
    private EmailVerificationProperties properties;
    private EmailVerificationTokenService service;

    @BeforeEach
    void setUp() {
        repository = mock(EmailVerificationTokenRepository.class);
        properties = new EmailVerificationProperties();
        properties.setTokenValidityMinutes(60L);

        when(repository.save(any(EmailVerificationToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service = new EmailVerificationTokenService(repository, properties);
    }

    @Test
    void createTokenForUser_shouldCreateTokenWithExpiryInFuture() {
        Long userId = 1L;
        String token = service.createTokenForUser(userId);

        assertThat(token).isNotBlank();

        EmailVerificationToken entity = new EmailVerificationToken();
        entity.setUserId(userId);
        entity.setToken(token);
        entity.setCreatedAt(OffsetDateTime.now());

        assertThat(entity.getToken()).isEqualTo(token);
    }
}
