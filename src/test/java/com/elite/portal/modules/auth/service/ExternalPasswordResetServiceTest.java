package com.elite.portal.modules.auth.service;

import com.elite.portal.modules.auth.model.PasswordResetToken;
import com.elite.portal.modules.auth.repository.PasswordResetTokenRepository;
import com.elite.portal.modules.user.model.ExternalUser;
import com.elite.portal.modules.user.repository.ExternalUserRepository;
import com.elite.portal.shared.email.EmailService;
import com.elite.portal.shared.logging.AppLogger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class ExternalPasswordResetServiceTest {

    private ExternalUserRepository externalUserRepository;
    private PasswordResetTokenRepository passwordResetTokenRepository;
    private EmailService emailService;
    private AppLogger logger;

    private ExternalPasswordResetService service;

    @BeforeEach
    public void setUp() {
        externalUserRepository = Mockito.mock(ExternalUserRepository.class);
        passwordResetTokenRepository = Mockito.mock(PasswordResetTokenRepository.class);
        emailService = Mockito.mock(EmailService.class);
        logger = Mockito.mock(AppLogger.class);

        service = new ExternalPasswordResetService(externalUserRepository, passwordResetTokenRepository, emailService, logger);

        // Impostazione tramite reflection dei parametri di configurazione
        setField(service, "tokenExpirationMinutes", 60);
        setField(service, "maxRequestsPerWindow", 5);
        setField(service, "rateLimitWindowMinutes", 60);
        setField(service, "resetPasswordBaseUrl", "https://portal/reset-password");
    }

    @Test
    public void testHandleForgotPassword_UserExists_TokenCreatedAndEmailSent() {
        String email = "user@example.com";

        ExternalUser user = new ExternalUser();
        user.setEmail(email);
        user.setFullName("Test User");

        when(externalUserRepository.findByEmailAndActiveTrueAndTypeStandardExternal(email))
                .thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.findByEmailAndCreatedAtAfter(anyString(), any(LocalDateTime.class)))
                .thenReturn(new ArrayList<>());

        service.handleForgotPassword(email);

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository, times(1)).save(tokenCaptor.capture());

        PasswordResetToken savedToken = tokenCaptor.getValue();
        assertEquals(email, savedToken.getEmail());
        assertNotNull(savedToken.getToken());
        assertNotNull(savedToken.getCreatedAt());
        assertNotNull(savedToken.getExpiresAt());
        assertTrue(savedToken.getExpiresAt().isAfter(savedToken.getCreatedAt()));

        verify(emailService, times(1))
                .sendPasswordResetEmail(Mockito.eq(email), Mockito.eq("Test User"), anyString());
    }

    @Test
    public void testHandleForgotPassword_UserDoesNotExist_NoTokenNoEmail() {
        String email = "unknown@example.com";

        when(externalUserRepository.findByEmailAndActiveTrueAndTypeStandardExternal(email))
                .thenReturn(Optional.empty());
        when(passwordResetTokenRepository.findByEmailAndCreatedAtAfter(anyString(), any(LocalDateTime.class)))
                .thenReturn(new ArrayList<>());

        service.handleForgotPassword(email);

        verify(passwordResetTokenRepository, never()).save(any(PasswordResetToken.class));
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString(), anyString());
    }

    @Test
    public void testHandleForgotPassword_RateLimited_NoTokenNoEmail() {
        String email = "user@example.com";

        ExternalUser user = new ExternalUser();
        user.setEmail(email);
        user.setFullName("Test User");

        when(externalUserRepository.findByEmailAndActiveTrueAndTypeStandardExternal(email))
                .thenReturn(Optional.of(user));

        List<PasswordResetToken> existingTokens = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            PasswordResetToken t = new PasswordResetToken();
            existingTokens.add(t);
        }
        when(passwordResetTokenRepository.findByEmailAndCreatedAtAfter(anyString(), any(LocalDateTime.class)))
                .thenReturn(existingTokens);

        service.handleForgotPassword(email);

        verify(passwordResetTokenRepository, never()).save(any(PasswordResetToken.class));
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString(), anyString());
    }

    private void setField(Object target, String fieldName, Object value) {
        try {
            java.lang.reflect.Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
