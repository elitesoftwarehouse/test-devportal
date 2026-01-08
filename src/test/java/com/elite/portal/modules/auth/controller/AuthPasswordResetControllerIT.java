package com.elite.portal.modules.auth.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.elite.portal.modules.auth.domain.PasswordResetToken;
import com.elite.portal.modules.auth.domain.PortalUser;
import com.elite.portal.modules.auth.repository.PasswordResetTokenRepository;
import com.elite.portal.modules.auth.repository.PortalUserRepository;
import com.elite.portal.modules.auth.support.TestAuthEmailServiceMock;
import com.elite.portal.modules.auth.support.TestClockConfig;

@SpringBootTest(classes = {TestClockConfig.class, TestAuthEmailServiceMock.class})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthPasswordResetControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PortalUserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private TestAuthEmailServiceMock emailServiceMock;

    @Autowired
    private Clock clock;

    @BeforeEach
    void setUp() {
        tokenRepository.deleteAll();
        userRepository.deleteAll();
        emailServiceMock.clear();

        PortalUser active = new PortalUser();
        active.setEmail("reset.active@elite-portal.test");
        active.setEnabled(true);
        active.setPasswordHash("OLD_HASH");
        userRepository.save(active);

        PortalUser disabled = new PortalUser();
        disabled.setEmail("reset.disabled@elite-portal.test");
        disabled.setEnabled(false);
        userRepository.save(disabled);

        assertThat(clock.instant()).isEqualTo(Instant.parse("2024-01-01T10:00:00Z"));
    }

    @Test
    @DisplayName("/auth/password/forgot - successo e invio email per utente attivo")
    void forgotPassword_success_activeUser() throws Exception {
        String payload = "{\"email\":\"reset.active@elite-portal.test\"}";

        mockMvc.perform(post("/auth/password/forgot")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        assertThat(emailServiceMock.getEmails())
            .hasSize(1)
            .first()
            .satisfies(email -> {
                assertThat(email.getTo()).isEqualTo("reset.active@elite-portal.test");
                assertThat(email.getSubject()).isEqualTo("RESET_PASSWORD");
                assertThat(email.getBody()).isNotBlank();
            });
    }

    @Test
    @DisplayName("/auth/password/forgot - nessuna informazione su email inesistente")
    void forgotPassword_noLeak_missingEmail() throws Exception {
        String payload = "{\"email\":\"missing@elite-portal.test\"}";

        mockMvc.perform(post("/auth/password/forgot")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        assertThat(emailServiceMock.getEmails()).isEmpty();
    }

    @Test
    @DisplayName("/auth/password/forgot - nessuna informazione su utente disabilitato")
    void forgotPassword_noLeak_disabledUser() throws Exception {
        String payload = "{\"email\":\"reset.disabled@elite-portal.test\"}";

        mockMvc.perform(post("/auth/password/forgot")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        assertThat(emailServiceMock.getEmails()).isEmpty();
    }

    @Test
    @DisplayName("/auth/password/forgot - rate limiting sull'email")
    void forgotPassword_rateLimiting() throws Exception {
        String payload = "{\"email\":\"reset.active@elite-portal.test\"}";

        mockMvc.perform(post("/auth/password/forgot")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(post("/auth/password/forgot")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isTooManyRequests());
    }

    @Test
    @DisplayName("/auth/password/reset - successo con token valido")
    void resetPassword_success_validToken() throws Exception {
        PortalUser user = userRepository.findByEmailIgnoreCase("reset.active@elite-portal.test").orElseThrow();

        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken("VALID_TOKEN");
        token.setCreatedAt(clock.instant());
        token.setExpiresAt(clock.instant().plusSeconds(3600));
        token.setUsed(false);
        tokenRepository.save(token);

        String payload = "{\"token\":\"VALID_TOKEN\",\"password\":\"NewPassword!1\"}";

        mockMvc.perform(post("/auth/password/reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        PortalUser updated = userRepository.findByEmailIgnoreCase("reset.active@elite-portal.test").orElseThrow();
        assertThat(updated.getPasswordHash()).isNotEqualTo("OLD_HASH");
    }

    @Test
    @DisplayName("/auth/password/reset - fallimento per token invalido")
    void resetPassword_failure_invalidToken() throws Exception {
        String payload = "{\"token\":\"UNKNOWN\",\"password\":\"NewPassword!1\"}";

        mockMvc.perform(post("/auth/password/reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.errorCode").value("RESET_TOKEN_INVALID"));
    }

    @Test
    @DisplayName("/auth/password/reset - fallimento per password non valida")
    void resetPassword_failure_invalidPassword() throws Exception {
        String payload = "{\"token\":\"ANY\",\"password\":\"short\"}";

        mockMvc.perform(post("/auth/password/reset")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false));
    }
}
