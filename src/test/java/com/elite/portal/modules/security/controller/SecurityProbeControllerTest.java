package com.elite.portal.modules.security.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test di integrazione MVC per {@link SecurityProbeController}.
 *
 * Nota: questi test assumono che la configurazione di sicurezza
 * generale dell'applicazione permetta accesso anonimo a /api/public/**
 * e richieda autenticazione per /api/secure/**.
 */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityProbeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /api/public/ping deve essere accessibile senza autenticazione")
    void publicPing_shouldReturnOkWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/api/public/ping"))
            .andExpect(status().isOk())
            .andExpect(content().string("public-ok"));
    }

    @Test
    @DisplayName("GET /api/secure/ping senza autenticazione deve restituire 401/unauthorized")
    void securePing_withoutAuthentication_shouldReturnUnauthorized() throws Exception {
        mockMvc.perform(get("/api/secure/ping"))
            .andExpect(result -> {
                int status = result.getResponse().getStatus();
                if (status != 401 && status != 403) {
                    throw new AssertionError("Expected 401 or 403 but was " + status);
                }
            });
    }

    @Test
    @WithMockUser
    @DisplayName("GET /api/secure/ping con utente autenticato deve restituire secure-ok")
    void securePing_withAuthenticatedUser_shouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/secure/ping"))
            .andExpect(status().isOk())
            .andExpect(content().string("secure-ok"));
    }

    @Test
    @DisplayName("POST /api/secure/echo senza autenticazione deve restituire 401/403")
    void secureEcho_withoutAuthentication_shouldReturnUnauthorizedOrForbidden() throws Exception {
        mockMvc.perform(post("/api/secure/echo")
                .contentType(MediaType.TEXT_PLAIN)
                .content("test-body"))
            .andExpect(result -> {
                int status = result.getResponse().getStatus();
                if (status != 401 && status != 403) {
                    throw new AssertionError("Expected 401 or 403 but was " + status);
                }
            });
    }

    @Test
    @WithMockUser(authorities = {"SCOPE_api.write"})
    @DisplayName("POST /api/secure/echo con SCOPE_api.write deve fare echo del payload")
    void secureEcho_withRequiredScope_shouldEchoPayload() throws Exception {
        String payload = "echo-payload";

        mockMvc.perform(post("/api/secure/echo")
                .contentType(MediaType.TEXT_PLAIN)
                .content(payload))
            .andExpect(status().isOk())
            .andExpect(content().string(payload));
    }

    @Test
    @WithMockUser(authorities = {"SCOPE_api.read"})
    @DisplayName("POST /api/secure/echo senza SCOPE_api.write deve restituire 403")
    void secureEcho_withoutRequiredScope_shouldReturnForbidden() throws Exception {
        mockMvc.perform(post("/api/secure/echo")
                .contentType(MediaType.TEXT_PLAIN)
                .content("payload"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = {"SCOPE_api.write"})
    @DisplayName("POST /api/secure/echo con body nullo deve restituire stringa vuota")
    void secureEcho_withNullBody_shouldReturnEmptyString() throws Exception {
        mockMvc.perform(post("/api/secure/echo")
                .contentType(MediaType.TEXT_PLAIN))
            .andExpect(status().isOk())
            .andExpect(content().string(""));
    }
}
