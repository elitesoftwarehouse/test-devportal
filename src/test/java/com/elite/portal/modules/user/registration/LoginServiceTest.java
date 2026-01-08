package com.elite.portal.modules.user.registration;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Test unitari per il servizio di login utenti esterni.
 */
@ExtendWith(MockitoExtension.class)
public class LoginServiceTest {

    @Mock
    private ExternalUserRepository externalUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private LoginService loginService;

    @Test
    @DisplayName("Login riuscito dopo completamento registrazione e stato ACTIVE")
    void loginShouldSucceedForActiveUserWithCorrectPassword() {
        ExternalUserEntity user = new ExternalUserEntity();
        user.setEmail("user@example.com");
        user.setStatus(ExternalUserStatus.ACTIVE);
        user.setPasswordHash("encoded-hash");

        when(externalUserRepository.findByEmail("user@example.com"))
            .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("StrongPassword123!", "encoded-hash"))
            .thenReturn(true);

        boolean result = loginService.login("user@example.com", "StrongPassword123!");
        assertTrue(result);
    }

    @Test
    @DisplayName("Login rifiutato se utente non esiste")
    void loginShouldFailForUnknownUser() {
        when(externalUserRepository.findByEmail("unknown@example.com"))
            .thenReturn(Optional.empty());

        boolean result = loginService.login("unknown@example.com", "StrongPassword123!");
        assertFalse(result);
        verifyNoMoreInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("Login rifiutato se stato utente non e' ACTIVE")
    void loginShouldFailForNonActiveUser() {
        ExternalUserEntity user = new ExternalUserEntity();
        user.setEmail("user@example.com");
        user.setStatus(ExternalUserStatus.APPROVED_PENDING_REGISTRATION);
        user.setPasswordHash("encoded-hash");

        when(externalUserRepository.findByEmail("user@example.com"))
            .thenReturn(Optional.of(user));

        boolean result = loginService.login("user@example.com", "StrongPassword123!");
        assertFalse(result);
    }

    @Test
    @DisplayName("Login rifiutato se password errata")
    void loginShouldFailForWrongPassword() {
        ExternalUserEntity user = new ExternalUserEntity();
        user.setEmail("user@example.com");
        user.setStatus(ExternalUserStatus.ACTIVE);
        user.setPasswordHash("encoded-hash");

        when(externalUserRepository.findByEmail("user@example.com"))
            .thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "encoded-hash"))
            .thenReturn(false);

        boolean result = loginService.login("user@example.com", "WrongPassword");
        assertFalse(result);
    }
}
