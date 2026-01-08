package com.elite.portal.modules.auth.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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

import com.elite.portal.modules.auth.domain.ExternalLoginToken;
import com.elite.portal.modules.auth.domain.PortalUser;
import com.elite.portal.modules.auth.exception.AuthErrorCode;
import com.elite.portal.modules.auth.exception.AuthException;
import com.elite.portal.modules.auth.repository.ExternalLoginTokenRepository;
import com.elite.portal.modules.auth.repository.PortalUserRepository;

@ExtendWith(MockitoExtension.class)
class ExternalLoginServiceTest {

    @Mock
    private PortalUserRepository userRepository;

    @Mock
    private ExternalLoginTokenRepository tokenRepository;

    @Mock
    private AuthEmailService emailService;

    private Clock clock;

    @InjectMocks
    private ExternalLoginService externalLoginService;

    @Captor
    private ArgumentCaptor<ExternalLoginToken> tokenCaptor;

    @BeforeEach
    void setUp() {
        clock = Clock.fixed(Instant.parse("2024-01-01T10:00:00Z"), ZoneId.of("UTC"));
        externalLoginService.setClock(clock);
    }

    private PortalUser buildActiveUser() {
        PortalUser user = new PortalUser();
        user.setId(1L);
        user.setEmail("user@elite-portal.test");
        user.setEnabled(true);
        return user;
    }

    @Nested
    @DisplayName("requestExternalLogin")
    class RequestExternalLogin {

        @Test
        void shouldGenerateTokenAndSendEmailForExistingUser() {
            PortalUser user = buildActiveUser();
            when(userRepository.findByEmailIgnoreCase("user@elite-portal.test"))
                .thenReturn(Optional.of(user));

            externalLoginService.requestExternalLogin("user@elite-portal.test", "127.0.0.1");

            verify(tokenRepository, times(1)).save(tokenCaptor.capture());
            ExternalLoginToken token = tokenCaptor.getValue();
            assertThat(token.getUser()).isEqualTo(user);
            assertThat(token.getCreatedAt()).isEqualTo(Instant.parse("2024-01-01T10:00:00Z"));
            assertThat(token.getExpiresAt()).isAfter(token.getCreatedAt());
            assertThat(token.isUsed()).isFalse();

            verify(emailService, times(1))
                .sendExternalLoginLink("user@elite-portal.test", token.getToken());
        }

        @Test
        void shouldBeNoOpForNonExistingUserToAvoidInformationLeak() {
            when(userRepository.findByEmailIgnoreCase("missing@elite-portal.test"))
                .thenReturn(Optional.empty());

            externalLoginService.requestExternalLogin("missing@elite-portal.test", "127.0.0.1");

            verify(tokenRepository, never()).save(any());
            verify(emailService, never()).sendExternalLoginLink(any(), any());
        }

        @Test
        void shouldNotGenerateTokenForDisabledUser() {
            PortalUser user = buildActiveUser();
            user.setEnabled(false);
            when(userRepository.findByEmailIgnoreCase("user@elite-portal.test"))
                .thenReturn(Optional.of(user));

            externalLoginService.requestExternalLogin("user@elite-portal.test", "127.0.0.1");

            verify(tokenRepository, never()).save(any());
            verify(emailService, never()).sendExternalLoginLink(any(), any());
        }
    }

    @Nested
    @DisplayName("consumeExternalLoginToken")
    class ConsumeExternalLoginToken {

        @Test
        void shouldReturnUserOnValidToken() {
            PortalUser user = buildActiveUser();
            ExternalLoginToken token = new ExternalLoginToken();
            token.setId(10L);
            token.setToken(UUID.randomUUID().toString());
            token.setUser(user);
            token.setCreatedAt(Instant.parse("2024-01-01T09:00:00Z"));
            token.setExpiresAt(Instant.parse("2024-01-01T11:00:00Z"));
            token.setUsed(false);

            when(tokenRepository.findByToken(token.getToken()))
                .thenReturn(Optional.of(token));

            PortalUser result = externalLoginService.consumeExternalLoginToken(token.getToken());

            assertThat(result).isEqualTo(user);
            assertThat(token.isUsed()).isTrue();
            verify(tokenRepository, times(1)).save(token);
        }

        @Test
        void shouldFailForUnknownToken() {
            when(tokenRepository.findByToken("unknown"))
                .thenReturn(Optional.empty());

            assertThatThrownBy(() -> externalLoginService.consumeExternalLoginToken("unknown"))
                .isInstanceOf(AuthException.class)
                .hasFieldOrPropertyWithValue("errorCode", AuthErrorCode.EXTERNAL_LOGIN_TOKEN_INVALID);
        }

        @Test
        void shouldFailForExpiredToken() {
            PortalUser user = buildActiveUser();
            ExternalLoginToken token = new ExternalLoginToken();
            token.setToken("expired");
            token.setUser(user);
            token.setCreatedAt(Instant.parse("2023-12-31T09:00:00Z"));
            token.setExpiresAt(Instant.parse("2023-12-31T10:00:00Z"));
            token.setUsed(false);

            when(tokenRepository.findByToken("expired"))
                .thenReturn(Optional.of(token));

            assertThatThrownBy(() -> externalLoginService.consumeExternalLoginToken("expired"))
                .isInstanceOf(AuthException.class)
                .hasFieldOrPropertyWithValue("errorCode", AuthErrorCode.EXTERNAL_LOGIN_TOKEN_EXPIRED);
        }

        @Test
        void shouldFailForAlreadyUsedToken() {
            PortalUser user = buildActiveUser();
            ExternalLoginToken token = new ExternalLoginToken();
            token.setToken("used");
            token.setUser(user);
            token.setCreatedAt(Instant.parse("2024-01-01T09:00:00Z"));
            token.setExpiresAt(Instant.parse("2024-01-01T11:00:00Z"));
            token.setUsed(true);

            when(tokenRepository.findByToken("used"))
                .thenReturn(Optional.of(token));

            assertThatThrownBy(() -> externalLoginService.consumeExternalLoginToken("used"))
                .isInstanceOf(AuthException.class)
                .hasFieldOrPropertyWithValue("errorCode", AuthErrorCode.EXTERNAL_LOGIN_TOKEN_ALREADY_USED);
        }

        @Test
        void shouldFailForDisabledUser() {
            PortalUser user = buildActiveUser();
            user.setEnabled(false);
            ExternalLoginToken token = new ExternalLoginToken();
            token.setToken("token");
            token.setUser(user);
            token.setCreatedAt(Instant.parse("2024-01-01T09:00:00Z"));
            token.setExpiresAt(Instant.parse("2024-01-01T11:00:00Z"));
            token.setUsed(false);

            when(tokenRepository.findByToken("token"))
                .thenReturn(Optional.of(token));

            assertThatThrownBy(() -> externalLoginService.consumeExternalLoginToken("token"))
                .isInstanceOf(AuthException.class)
                .hasFieldOrPropertyWithValue("errorCode", AuthErrorCode.USER_DISABLED);
        }
    }
}
