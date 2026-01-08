package com.elite.portal.modules.auth.verification;

import com.elite.portal.modules.auth.user.ExternalUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

/**
 * Test di unità per EmailVerificationTokenService che coprono:
 * - generazione token (formato, scadenza, unicità) e persistenza
 * - logica di verifica token (valido, scaduto, inesistente, già utilizzato)
 */
public class EmailVerificationTokenServiceTest {

    private EmailVerificationTokenRepository tokenRepository;
    private Clock fixedClock;
    private EmailVerificationTokenService tokenService;

    private final Instant NOW = Instant.parse("2024-01-01T10:00:00Z");

    @BeforeEach
    void setUp() {
        tokenRepository = mock(EmailVerificationTokenRepository.class);
        fixedClock = Clock.fixed(NOW, ZoneOffset.UTC);
        tokenService = new EmailVerificationTokenService(tokenRepository, fixedClock);
    }

    @Test
    @DisplayName("Generazione token: formato UUID, scadenza corretta e persistenza")
    void generateToken_persistsWithCorrectExpiration() {
        ExternalUser user = new ExternalUser();
        user.setId(123L);

        ArgumentCaptor<EmailVerificationToken> captor = ArgumentCaptor.forClass(EmailVerificationToken.class);
        when(tokenRepository.save(any(EmailVerificationToken.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        EmailVerificationToken token = tokenService.createTokenForUser(user);

        assertThat(token.getUser()).isSameAs(user);
        assertThat(token.getToken()).isNotNull();
        // verifica formato UUID
        UUID.fromString(token.getToken());

        LocalDateTime expectedExpiration = LocalDateTime.ofInstant(NOW, ZoneOffset.UTC)
            .plusHours(EmailVerificationTokenService.DEFAULT_EXPIRATION_HOURS);
        assertThat(token.getExpiresAt()).isEqualTo(expectedExpiration);
        assertThat(token.isUsed()).isFalse();

        verify(tokenRepository).save(captor.capture());
        EmailVerificationToken persisted = captor.getValue();
        assertThat(persisted.getToken()).isEqualTo(token.getToken());
        assertThat(persisted.getUser()).isSameAs(user);
        assertThat(persisted.getExpiresAt()).isEqualTo(expectedExpiration);
        assertThat(persisted.isUsed()).isFalse();
        verifyNoMoreInteractions(tokenRepository);
    }

    @Test
    @DisplayName("Verifica token valido: marca come usato e restituisce utente")
    void verifyValidToken_marksAsUsedAndReturnsUser() {
        ExternalUser user = new ExternalUser();
        user.setId(999L);

        EmailVerificationToken stored = new EmailVerificationToken();
        stored.setId(1L);
        stored.setToken("test-token");
        stored.setUser(user);
        stored.setUsed(false);
        stored.setExpiresAt(LocalDateTime.ofInstant(NOW, ZoneOffset.UTC).plusHours(1));

        when(tokenRepository.findByToken("test-token")).thenReturn(Optional.of(stored));
        when(tokenRepository.save(any(EmailVerificationToken.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        ExternalUser result = tokenService.verifyToken("test-token");

        assertThat(result).isSameAs(user);
        assertThat(stored.isUsed()).isTrue();
        verify(tokenRepository).findByToken("test-token");
        verify(tokenRepository).save(stored);
        verifyNoMoreInteractions(tokenRepository);
    }

    @Test
    @DisplayName("Token inesistente genera EmailVerificationException")
    void verifyNonExistingToken_throwsException() {
        when(tokenRepository.findByToken("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tokenService.verifyToken("missing"))
            .isInstanceOf(EmailVerificationException.class)
            .hasMessageContaining("Token non valido");

        verify(tokenRepository).findByToken("missing");
        verifyNoMoreInteractions(tokenRepository);
    }

    @Test
    @DisplayName("Token già utilizzato genera EmailVerificationException")
    void verifyUsedToken_throwsException() {
        ExternalUser user = new ExternalUser();
        user.setId(1L);

        EmailVerificationToken stored = new EmailVerificationToken();
        stored.setToken("used-token");
        stored.setUser(user);
        stored.setUsed(true);
        stored.setExpiresAt(LocalDateTime.ofInstant(NOW, ZoneOffset.UTC).plusHours(1));

        when(tokenRepository.findByToken("used-token")).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> tokenService.verifyToken("used-token"))
            .isInstanceOf(EmailVerificationException.class)
            .hasMessageContaining("già utilizzato");

        verify(tokenRepository).findByToken("used-token");
        verifyNoMoreInteractions(tokenRepository);
    }

    @Test
    @DisplayName("Token scaduto genera EmailVerificationException")
    void verifyExpiredToken_throwsException() {
        ExternalUser user = new ExternalUser();
        user.setId(1L);

        EmailVerificationToken stored = new EmailVerificationToken();
        stored.setToken("expired-token");
        stored.setUser(user);
        stored.setUsed(false);
        stored.setExpiresAt(LocalDateTime.ofInstant(NOW, ZoneOffset.UTC).minusMinutes(1));

        when(tokenRepository.findByToken("expired-token")).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> tokenService.verifyToken("expired-token"))
            .isInstanceOf(EmailVerificationException.class)
            .hasMessageContaining("scaduto");

        verify(tokenRepository).findByToken("expired-token");
        verifyNoMoreInteractions(tokenRepository);
    }
}
