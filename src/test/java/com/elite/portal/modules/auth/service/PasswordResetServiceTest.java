package com.elite.portal.modules.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.elite.portal.modules.auth.domain.PasswordResetToken;
import com.elite.portal.modules.auth.domain.PortalUser;
import com.elite.portal.modules.auth.exception.AuthException;
import com.elite.portal.modules.auth.exception.AuthErrorCode;
import com.elite.portal.modules.auth.repository.PasswordResetTokenRepository;
import com.elite.portal.modules.auth.repository.PortalUserRepository;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private PortalUserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private AuthEmailService emailService;

    private Clock clock;

    @InjectMocks
    private PasswordResetService passwordResetService;

    @Captor
    private ArgumentCaptor<PasswordResetToken> tokenCaptor;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(Instant.parse("2024-01-01T10:00:00Z"), ZoneId.of("UTC"));
        passwordResetService.setClock(clock);
    }

    private PortalUser buildActiveUser() {
        PortalUser user = new PortalUser();
        user.setId(1L);
        user.setEmail("user@elite-portal.test");
        user.setEnabled(true);
        user.setPasswordHash("OLD_HASH");
        return user;
    }

    @Nested
    @DisplayName("generateResetToken")
    class GenerateResetToken {

        @Test
        void shouldGenerateTokenAndSendEmailForExistingUser() {
            PortalUser user = buildActiveUser();
            when(userRepository.findByEmailIgnoreCase("user@elite-portal.test"))
                .thenReturn(Optional.of(user));

            passwordResetService.generateResetToken("user@elite-portal.test", "127.0.0.1");

            verify(tokenRepository, times(1)).save(tokenCaptor.capture());
            PasswordResetToken token = tokenCaptor.getValue();
            assertThat(token.getUser()).isEqualTo(user);
            assertThat(token.getCreatedAt()).isEqualTo(Instant.parse("2024-01-01T10:00:00Z"));
            assertThat(token.getExpiresAt()).isAfter(token.getCreatedAt());
            assertThat(token.isUsed()).isFalse();

            verify(emailService, times(1))
                .sendPasswordResetEmail(eq("user@elite-portal.test"), any(String.class));
        }

        @Test
        void shouldBeNoOpForNonExistingUserToAvoidInformationLeak() {
            when(userRepository.findByEmailIgnoreCase("missing@elite-portal.test"))
                .thenReturn(Optional.empty());

            passwordResetService.generateResetToken("missing@elite-portal.test", "127.0.0.1");

            verify(tokenRepository, never()).save(any());
            verify(emailService, never()).sendPasswordResetEmail(any(), any());
        }

        @Test
        void shouldNotGenerateTokenForDisabledUser() {
            PortalUser user = buildActiveUser();
            user.setEnabled(false);
            when(userRepository.findByEmailIgnoreCase("user@elite-portal.test"))
                .thenReturn(Optional.of(user));

            passwordResetService.generateResetToken("user@elite-portal.test", "127.0.0.1");

            verify(tokenRepository, never()).save(any());
            verify(emailService, never()).sendPasswordResetEmail(any(), any());
        }
    }

    @Nested
    @DisplayName("resetPassword")
    class ResetPassword {

        @Test
        void shouldResetPasswordWithValidToken() {
            PortalUser user = buildActiveUser();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setId(10L);
            resetToken.setToken(UUID.randomUUID().toString());
            resetToken.setUser(user);
            resetToken.setCreatedAt(Instant.parse("2024-01-01T09:00:00Z"));
            resetToken.setExpiresAt(Instant.parse("2024-01-01T11:00:00Z"));
            resetToken.setUsed(false);

            when(tokenRepository.findByToken(resetToken.getToken()))
                .thenReturn(Optional.of(resetToken));

            passwordResetService.resetPassword(resetToken.getToken(), "NewPassword!1");

            assertThat(user.getPasswordHash()).isNotEqualTo("OLD_HASH");
            assertThat(resetToken.isUsed()).isTrue();

            verify(tokenRepository, times(1)).save(resetToken);
            verify(userRepository, times(1)).save(user);
        }

        @Test
        void shouldFailForUnknownToken() {
            when(tokenRepository.findByToken("unknown")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> passwordResetService.resetPassword("unknown", "pwd"))
                .isInstanceOf(AuthException.class)
                .hasFieldOrPropertyWithValue("errorCode", AuthErrorCode.RESET_TOKEN_INVALID);
        }

        @Test
        void shouldFailForExpiredToken() {
            PortalUser user = buildActiveUser();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken("expired");
            resetToken.setUser(user);
            resetToken.setCreatedAt(Instant.parse("2023-12-31T09:00:00Z"));
            resetToken.setExpiresAt(Instant.parse("2023-12-31T10:00:00Z"));
            resetToken.setUsed(false);

            when(tokenRepository.findByToken("expired"))
                .thenReturn(Optional.of(resetToken));

            assertThatThrownBy(() -> passwordResetService.resetPassword("expired", "pwd"))
                .isInstanceOf(AuthException.class)
                .hasFieldOrPropertyWithValue("errorCode", AuthErrorCode.RESET_TOKEN_EXPIRED);
        }

        @Test
        void shouldFailForAlreadyUsedToken() {
            PortalUser user = buildActiveUser();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken("used");
            resetToken.setUser(user);
            resetToken.setCreatedAt(Instant.parse("2024-01-01T09:00:00Z"));
            resetToken.setExpiresAt(Instant.parse("2024-01-01T11:00:00Z"));
            resetToken.setUsed(true);

            when(tokenRepository.findByToken("used"))
                .thenReturn(Optional.of(resetToken));

            assertThatThrownBy(() -> passwordResetService.resetPassword("used", "pwd"))
                .isInstanceOf(AuthException.class)
                .hasFieldOrPropertyWithValue("errorCode", AuthErrorCode.RESET_TOKEN_ALREADY_USED);
        }

        @Test
        void shouldFailForDisabledUser() {
            PortalUser user = buildActiveUser();
            user.setEnabled(false);
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken("token");
            resetToken.setUser(user);
            resetToken.setCreatedAt(Instant.parse("2024-01-01T09:00:00Z"));
            resetToken.setExpiresAt(Instant.parse("2024-01-01T11:00:00Z"));
            resetToken.setUsed(false);

            when(tokenRepository.findByToken("token"))
                .thenReturn(Optional.of(resetToken));

            assertThatThrownBy(() -> passwordResetService.resetPassword("token", "pwd"))
                .isInstanceOf(AuthException.class)
                .hasFieldOrPropertyWithValue("errorCode", AuthErrorCode.USER_DISABLED);
        }

        @Test
        void shouldValidateNewPasswordFormat() {
            PortalUser user = buildActiveUser();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken("token");
            resetToken.setUser(user);
            resetToken.setCreatedAt(Instant.parse("2024-01-01T09:00:00Z"));
            resetToken.setExpiresAt(Instant.parse("2024-01-01T11:00:00Z"));
            resetToken.setUsed(false);

            when(tokenRepository.findByToken("token"))
                .thenReturn(Optional.of(resetToken));

            assertThatThrownBy(() -> passwordResetService.resetPassword("token", "short"))
                .isInstanceOf(AuthException.class)
                .hasFieldOrPropertyWithValue("errorCode", AuthErrorCode.PASSWORD_NOT_VALID);
        }
    }
}
