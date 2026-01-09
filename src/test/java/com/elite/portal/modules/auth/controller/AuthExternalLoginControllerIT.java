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

import com.elite.portal.modules.auth.domain.PortalUser;
import com.elite.portal.modules.auth.repository.PortalUserRepository;
import com.elite.portal.modules.auth.support.TestAuthEmailServiceMock;
import com.elite.portal.modules.auth.support.TestClockConfig;

@SpringBootTest(classes = {TestClockConfig.class, TestAuthEmailServiceMock.class})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthExternalLoginControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PortalUserRepository userRepository;

    @Autowired
    private TestAuthEmailServiceMock emailServiceMock;

    @Autowired
    private Clock clock;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        emailServiceMock.clear();

        PortalUser active = new PortalUser();
        active.setEmail("external.active@elite-portal.test");
        active.setEnabled(true);
        userRepository.save(active);

        PortalUser disabled = new PortalUser();
        disabled.setEmail("external.disabled@elite-portal.test");
        disabled.setEnabled(false);
        userRepository.save(disabled);

        assertThat(clock.instant()).isEqualTo(Instant.parse("2024-01-01T10:00:00Z"));
    }

    @Test
    @DisplayName("/auth/external/login - successo per utente attivo")
    void externalLoginRequest_success_activeUser() throws Exception {
        String payload = "{\"email\":\"external.active@elite-portal.test\"}";

        mockMvc.perform(post("/auth/external/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        assertThat(emailServiceMock.getEmails())
            .hasSize(1)
            .first()
            .satisfies(email -> {
                assertThat(email.getTo()).isEqualTo("external.active@elite-portal.test");
                assertThat(email.getSubject()).isEqualTo("EXTERNAL_LOGIN");
                assertThat(email.getBody()).isNotBlank();
            });
    }

    @Test
    @DisplayName("/auth/external/login - nessuna informazione su email inesistente")
    void externalLoginRequest_noLeak_forMissingEmail() throws Exception {
        String payload = "{\"email\":\"missing@elite-portal.test\"}";

        mockMvc.perform(post("/auth/external/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        assertThat(emailServiceMock.getEmails()).isEmpty();
    }

    @Test
    @DisplayName("/auth/external/login - nessuna informazione su utente disabilitato")
    void externalLoginRequest_noLeak_forDisabledUser() throws Exception {
        String payload = "{\"email\":\"external.disabled@elite-portal.test\"}";

        mockMvc.perform(post("/auth/external/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        assertThat(emailServiceMock.getEmails()).isEmpty();
    }
}
