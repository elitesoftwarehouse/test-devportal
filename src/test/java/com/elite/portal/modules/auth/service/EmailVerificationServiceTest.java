package com.elite.portal.modules.auth.service;

import com.elite.portal.modules.auth.dto.EmailVerificationResponseDto;
import com.elite.portal.modules.auth.exception.EmailVerificationException;
import com.elite.portal.modules.auth.model.ExternalUser;
import com.elite.portal.modules.auth.repository.ExternalUserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class EmailVerificationServiceTest {

    private ExternalUserRepository externalUserRepository;
    private EmailVerificationService emailVerificationService;

    @BeforeEach
    public void setUp() {
        externalUserRepository = Mockito.mock(ExternalUserRepository.class);
        emailVerificationService = new EmailVerificationService(externalUserRepository);
    }

    @Test
    public void testVerifyEmail_Success() {
        String token = "valid-token";
        ExternalUser user = new ExternalUser();
        user.setEmail("test@example.com");
        user.setPasswordHash("hash");
        user.setEmailVerified(false);
        user.setEmailVerificationToken(token);
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(1));

        when(externalUserRepository.findByEmailVerificationToken(token)).thenReturn(Optional.of(user));
        when(externalUserRepository.save(any(ExternalUser.class))).thenReturn(user);

        EmailVerificationResponseDto response = emailVerificationService.verifyEmail(token);

        Assertions.assertTrue(response.isSuccess());
        Assertions.assertEquals("EMAIL_VERIFICATION_SUCCESS", response.getCode());
        Assertions.assertFalse(response.isEmailAlreadyVerified());
        Assertions.assertTrue(user.isEmailVerified());
        Assertions.assertNull(user.getEmailVerificationToken());
        Assertions.assertNull(user.getEmailVerificationTokenExpiry());

        verify(externalUserRepository).save(user);
    }

    @Test
    public void testVerifyEmail_TokenMissing() {
        EmailVerificationException ex = Assertions.assertThrows(EmailVerificationException.class,
                () -> emailVerificationService.verifyEmail(" "));

        Assertions.assertEquals("EMAIL_VERIFICATION_TOKEN_MISSING", ex.getCode());
    }

    @Test
    public void testVerifyEmail_TokenInvalid() {
        String token = "invalid-token";
        when(externalUserRepository.findByEmailVerificationToken(token)).thenReturn(Optional.empty());

        EmailVerificationException ex = Assertions.assertThrows(EmailVerificationException.class,
                () -> emailVerificationService.verifyEmail(token));

        Assertions.assertEquals("EMAIL_VERIFICATION_TOKEN_INVALID", ex.getCode());
    }

    @Test
    public void testVerifyEmail_TokenExpired() {
        String token = "expired-token";
        ExternalUser user = new ExternalUser();
        user.setEmail("test@example.com");
        user.setPasswordHash("hash");
        user.setEmailVerified(false);
        user.setEmailVerificationToken(token);
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().minusMinutes(5));

        when(externalUserRepository.findByEmailVerificationToken(token)).thenReturn(Optional.of(user));

        EmailVerificationException ex = Assertions.assertThrows(EmailVerificationException.class,
                () -> emailVerificationService.verifyEmail(token));

        Assertions.assertEquals("EMAIL_VERIFICATION_TOKEN_EXPIRED", ex.getCode());
    }

    @Test
    public void testVerifyEmail_AlreadyVerified() {
        String token = "already-verified-token";
        ExternalUser user = new ExternalUser();
        user.setEmail("test@example.com");
        user.setPasswordHash("hash");
        user.setEmailVerified(true);
        user.setEmailVerificationToken(token);
        user.setEmailVerificationTokenExpiry(LocalDateTime.now().plusHours(1));

        when(externalUserRepository.findByEmailVerificationToken(token)).thenReturn(Optional.of(user));

        EmailVerificationResponseDto response = emailVerificationService.verifyEmail(token);

        Assertions.assertTrue(response.isSuccess());
        Assertions.assertEquals("EMAIL_ALREADY_VERIFIED", response.getCode());
        Assertions.assertTrue(response.isEmailAlreadyVerified());
    }
}
