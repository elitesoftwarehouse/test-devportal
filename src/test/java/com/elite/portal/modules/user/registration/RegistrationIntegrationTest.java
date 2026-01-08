package com.elite.portal.modules.user.registration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * Test di integrazione end-to-end per il flusso di completamento registrazione
 * e primo login di un collaboratore esterno.
 */
@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class RegistrationIntegrationTest {

    @Configuration
    static class TestConfig {
        @Bean
        public Clock clock() {
            return Clock.fixed(Instant.parse("2023-08-01T10:15:30.00Z"), ZoneOffset.UTC);
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }
    }

    @Autowired
    private ExternalUserRepository externalUserRepository;

    @Autowired
    private RegistrationTokenRepository registrationTokenRepository;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private LoginService loginService;

    private Instant now;

    @Autowired
    private Clock clock;

    @BeforeEach
    void setUp() {
        now = clock.instant();
    }

    @Test
    @Transactional
    @DisplayName("Flusso completo: APPROVED_PENDING_REGISTRATION -> ACTIVE, token invalidato e login riuscito")
    void completeRegistrationFlowAndLogin() {
        ExternalUserEntity user = new ExternalUserEntity();
        user.setEmail("integration@example.com");
        user.setStatus(ExternalUserStatus.APPROVED_PENDING_REGISTRATION);
        user.setCreatedAt(now.minusSeconds(3600));
        user.setUpdatedAt(now.minusSeconds(3600));
        externalUserRepository.save(user);

        RegistrationTokenEntity token = new RegistrationTokenEntity();
        token.setToken("integration-token");
        token.setExternalUser(user);
        token.setExpiresAt(now.plusSeconds(3600));
        token.setStatus(RegistrationTokenStatus.VALID);
        token.setCreatedAt(now.minusSeconds(60));
        token.setUpdatedAt(now.minusSeconds(60));
        registrationTokenRepository.save(token);

        registrationService.completeRegistration("integration-token", "StrongPassword123!");

        ExternalUserEntity reloadedUser = externalUserRepository.findByEmail("integration@example.com")
            .orElseThrow(() -> new IllegalStateException("User not found after registration"));

        assertEquals(ExternalUserStatus.ACTIVE, reloadedUser.getStatus());
        assertThat(reloadedUser.getPasswordHash()).isNotBlank();
        assertThat(reloadedUser.getPasswordHash()).doesNotContain("StrongPassword123!");

        RegistrationTokenEntity reloadedToken = registrationTokenRepository.findByToken("integration-token")
            .orElseThrow(() -> new IllegalStateException("Token not found after registration"));

        assertEquals(RegistrationTokenStatus.USED, reloadedToken.getStatus());

        boolean loginOk = loginService.login("integration@example.com", "StrongPassword123!");
        assertTrue(loginOk);

        boolean loginFailWrongPassword = loginService.login("integration@example.com", "WrongPassword!");
        assertFalse(loginFailWrongPassword);
    }

    @Test
    @Transactional
    @DisplayName("Login rifiutato se utente ancora in APPROVED_PENDING_REGISTRATION")
    void loginRejectedForPendingUser() {
        ExternalUserEntity user = new ExternalUserEntity();
        user.setEmail("pending@example.com");
        user.setStatus(ExternalUserStatus.APPROVED_PENDING_REGISTRATION);
        user.setCreatedAt(now.minusSeconds(3600));
        user.setUpdatedAt(now.minusSeconds(3600));
        user.setPasswordHash("some-hash");
        externalUserRepository.save(user);

        boolean loginOk = loginService.login("pending@example.com", "any");
        assertFalse(loginOk);
    }

    @Test
    @Transactional
    @DisplayName("Token scaduto nel database impedisce completamento registrazione")
    void expiredTokenInDatabasePreventsRegistration() {
        ExternalUserEntity user = new ExternalUserEntity();
        user.setEmail("expired@example.com");
        user.setStatus(ExternalUserStatus.APPROVED_PENDING_REGISTRATION);
        user.setCreatedAt(now.minusSeconds(3600));
        user.setUpdatedAt(now.minusSeconds(3600));
        externalUserRepository.save(user);

        RegistrationTokenEntity token = new RegistrationTokenEntity();
        token.setToken("expired-integration-token");
        token.setExternalUser(user);
        token.setExpiresAt(now.minusSeconds(5));
        token.setStatus(RegistrationTokenStatus.VALID);
        token.setCreatedAt(now.minusSeconds(20));
        token.setUpdatedAt(now.minusSeconds(20));
        registrationTokenRepository.save(token);

        boolean failed = false;
        try {
            registrationService.completeRegistration("expired-integration-token", "StrongPassword123!");
        } catch (IllegalStateException ex) {
            failed = true;
            assertEquals("Token scaduto", ex.getMessage());
        }
        assertTrue(failed);

        ExternalUserEntity reloadedUser = externalUserRepository.findByEmail("expired@example.com")
            .orElseThrow(() -> new IllegalStateException("User not found"));

        assertEquals(ExternalUserStatus.APPROVED_PENDING_REGISTRATION, reloadedUser.getStatus());
    }
}
