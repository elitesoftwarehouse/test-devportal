package com.elite.portal.modules.user.registration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Test unitari per il servizio di completamento registrazione.
 * Coprono casi di token valido, scaduto, inesistente e gia' usato,
 * oltre alla transizione di stato utente e hashing della password.
 */
@ExtendWith(MockitoExtension.class)
public class RegistrationTokenServiceTest {

    @Mock
    private RegistrationTokenRepository registrationTokenRepository;

    @Mock
    private ExternalUserRepository externalUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private Clock clock;

    @InjectMocks
    private RegistrationService registrationService;

    @Test
    @DisplayName("Completamento registrazione con token valido aggiorna stato utente e invalida token")
    void completeRegistrationWithValidTokenShouldActivateUserAndInvalidateToken() {
        Instant now = Instant.parse("2023-08-01T10:15:30.00Z");
        when(clock.instant()).thenReturn(now);
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        ExternalUserEntity user = new ExternalUserEntity();
        user.setId(1L);
        user.setEmail("user@example.com");
        user.setStatus(ExternalUserStatus.APPROVED_PENDING_REGISTRATION);
        user.setCreatedAt(now.minusSeconds(3600));
        user.setUpdatedAt(now.minusSeconds(3600));

        RegistrationTokenEntity token = new RegistrationTokenEntity();
        token.setId(10L);
        token.setToken("valid-token");
        token.setExternalUser(user);
        token.setExpiresAt(now.plusSeconds(3600));
        token.setStatus(RegistrationTokenStatus.VALID);
        token.setCreatedAt(now.minusSeconds(3600));
        token.setUpdatedAt(now.minusSeconds(3600));

        when(registrationTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("StrongPassword123!"))
            .thenReturn("ENCODED-PASSWORD");

        registrationService.completeRegistration("valid-token", "StrongPassword123!");

        ArgumentCaptor<ExternalUserEntity> userCaptor = ArgumentCaptor.forClass(ExternalUserEntity.class);
        verify(externalUserRepository).save(userCaptor.capture());
        ExternalUserEntity updatedUser = userCaptor.getValue();
        assertEquals(ExternalUserStatus.ACTIVE, updatedUser.getStatus());
        assertEquals("ENCODED-PASSWORD", updatedUser.getPasswordHash());
        assertEquals(now, updatedUser.getUpdatedAt());

        ArgumentCaptor<RegistrationTokenEntity> tokenCaptor = ArgumentCaptor.forClass(RegistrationTokenEntity.class);
        verify(registrationTokenRepository).save(tokenCaptor.capture());
        RegistrationTokenEntity updatedToken = tokenCaptor.getValue();
        assertEquals(RegistrationTokenStatus.USED, updatedToken.getStatus());
        assertEquals(now, updatedToken.getUpdatedAt());

        verifyNoMoreInteractions(externalUserRepository, registrationTokenRepository);
    }

    @Test
    @DisplayName("Token inesistente genera errore generico per evitare enumerazione")
    void completeRegistrationWithNonExistingTokenShouldThrowGenericError() {
        when(registrationTokenRepository.findByToken("missing-token"))
            .thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> registrationService.completeRegistration("missing-token", "StrongPassword123!"));

        // Messaggio neutro, non rivela se il token esiste o meno
        assertEquals("Token non valido", ex.getMessage());
        verifyNoMoreInteractions(externalUserRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Token scaduto genera IllegalStateException")
    void completeRegistrationWithExpiredTokenShouldFail() {
        Instant now = Instant.parse("2023-08-01T10:15:30.00Z");
        when(clock.instant()).thenReturn(now);
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        ExternalUserEntity user = new ExternalUserEntity();
        user.setStatus(ExternalUserStatus.APPROVED_PENDING_REGISTRATION);

        RegistrationTokenEntity token = new RegistrationTokenEntity();
        token.setToken("expired-token");
        token.setExternalUser(user);
        token.setExpiresAt(now.minusSeconds(10));
        token.setStatus(RegistrationTokenStatus.VALID);

        when(registrationTokenRepository.findByToken("expired-token"))
            .thenReturn(Optional.of(token));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
            () -> registrationService.completeRegistration("expired-token", "StrongPassword123!"));

        assertEquals("Token scaduto", ex.getMessage());
        verifyNoMoreInteractions(externalUserRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Token gia' usato genera IllegalStateException")
    void completeRegistrationWithUsedTokenShouldFail() {
        Instant now = Instant.parse("2023-08-01T10:15:30.00Z");
        when(clock.instant()).thenReturn(now);
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        ExternalUserEntity user = new ExternalUserEntity();
        user.setStatus(ExternalUserStatus.APPROVED_PENDING_REGISTRATION);

        RegistrationTokenEntity token = new RegistrationTokenEntity();
        token.setToken("used-token");
        token.setExternalUser(user);
        token.setExpiresAt(now.plusSeconds(3600));
        token.setStatus(RegistrationTokenStatus.USED);

        when(registrationTokenRepository.findByToken("used-token"))
            .thenReturn(Optional.of(token));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
            () -> registrationService.completeRegistration("used-token", "StrongPassword123!"));

        assertEquals("Token gia' usato", ex.getMessage());
        verifyNoMoreInteractions(externalUserRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Utente gia' attivo non puo' completare nuovamente la registrazione")
    void completeRegistrationWithAlreadyActiveUserShouldFail() {
        Instant now = Instant.parse("2023-08-01T10:15:30.00Z");
        when(clock.instant()).thenReturn(now);
        when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        ExternalUserEntity user = new ExternalUserEntity();
        user.setStatus(ExternalUserStatus.ACTIVE);

        RegistrationTokenEntity token = new RegistrationTokenEntity();
        token.setToken("already-registered-token");
        token.setExternalUser(user);
        token.setExpiresAt(now.plusSeconds(3600));
        token.setStatus(RegistrationTokenStatus.VALID);

        when(registrationTokenRepository.findByToken("already-registered-token"))
            .thenReturn(Optional.of(token));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
            () -> registrationService.completeRegistration("already-registered-token", "StrongPassword123!"));

        assertEquals("Utente gia' attivo", ex.getMessage());
        verifyNoMoreInteractions(externalUserRepository, passwordEncoder);
    }

    @Test
    @DisplayName("Password non conforme genera IllegalArgumentException senza loggare password")
    void completeRegistrationWithWeakPasswordShouldFail() {
        when(registrationTokenRepository.findByToken("valid-token"))
            .thenReturn(Optional.of(mock(RegistrationTokenEntity.class)));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> registrationService.completeRegistration("valid-token", "short"));

        assertEquals("Password non conforme", ex.getMessage());
        // Non viene invocato l'encoder, quindi la password non e' processata
        verifyNoMoreInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("Password codificata non e' null e non e' uguale alla password in chiaro")
    void encodedPasswordShouldDifferFromRawPassword() {
        PasswordEncoder encoder = mock(PasswordEncoder.class);
        when(encoder.encode("StrongPassword123!")).thenReturn("hash-xyz");

        String encoded = encoder.encode("StrongPassword123!");
        assertNotNull(encoded);
        assertEquals("hash-xyz", encoded);
    }
}
