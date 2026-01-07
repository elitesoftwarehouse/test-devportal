package com.elite.portal.modules.home.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import java.util.function.Consumer;
import java.util.Map;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

/**
 * Test di integrazione per HomeController, focalizzati sulla risoluzione del displayName
 * partendo dagli attributi dell'utente OAuth2/OIDC e sulla view name.
 *
 * Ordine di preferenza atteso:
 * 1) name
 * 2) preferred_username
 * 3) email
 * 4) fallback a principal name
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        // Configurazione OIDC fittizia per consentire il bootstrap del contesto senza contattare provider esterni
        "spring.security.oauth2.client.registration.test.client-id=test-client",
        "spring.security.oauth2.client.registration.test.client-secret=test-secret",
        "spring.security.oauth2.client.registration.test.authorization-grant-type=authorization_code",
        "spring.security.oauth2.client.registration.test.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}",
        "spring.security.oauth2.client.registration.test.scope=openid,profile,email",
        "spring.security.oauth2.client.provider.test.authorization-uri=https://example.com/auth",
        "spring.security.oauth2.client.provider.test.token-uri=https://example.com/token",
        "spring.security.oauth2.client.provider.test.jwk-set-uri=https://example.com/jwks",
        "spring.security.oauth2.client.provider.test.user-info-uri=https://example.com/userinfo",
        "spring.security.oauth2.client.provider.test.user-name-attribute=sub"
})
class HomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Preferisce attributo 'name' se presente")
    void whenNameAttributePresent_thenWelcomeUsesName() throws Exception {
        mockMvc.perform(
                        get("/")
                                .with(oauth2Login().attributes(attrs -> attrs.put("name", "Mario Rossi")))
                )
                .andExpect(status().isOk())
                .andExpect(view().name("home/index"))
                .andExpect(content().string(containsString("Benvenuto, Mario Rossi")));
    }

    @Test
    @DisplayName("Preferisce 'preferred_username' quando 'name' non è presente")
    void whenPreferredUsernamePresentAndNoName_thenWelcomeUsesPreferredUsername() throws Exception {
        mockMvc.perform(
                        get("/")
                                .with(oauth2Login().attributes(attrs -> {
                                    attrs.remove("name");
                                    attrs.put("preferred_username", "mrossi");
                                }))
                )
                .andExpect(status().isOk())
                .andExpect(view().name("home/index"))
                .andExpect(content().string(containsString("Benvenuto, mrossi")));
    }

    @Test
    @DisplayName("Preferisce 'email' quando 'name' e 'preferred_username' non sono presenti")
    void whenEmailPresentAndNoNameOrPreferredUsername_thenWelcomeUsesEmail() throws Exception {
        mockMvc.perform(
                        get("/")
                                .with(oauth2Login().attributes(attrs -> {
                                    attrs.remove("name");
                                    attrs.remove("preferred_username");
                                    attrs.put("email", "mario@example.com");
                                }))
                )
                .andExpect(status().isOk())
                .andExpect(view().name("home/index"))
                .andExpect(content().string(containsString("Benvenuto, mario@example.com")));
    }

    @Test
    @DisplayName("Fallback al principal name quando nessun attributo è disponibile")
    void whenNoRelevantAttributes_thenFallbackToPrincipalName() throws Exception {
        // Consumer che rimuove tutti gli attributi eventualmente preimpostati dal processor
        Consumer<Map<String, Object>> clearAll = Map::clear;

        mockMvc.perform(
                        get("/")
                                .with(oauth2Login()
                                        .attributes(clearAll)
                                        .name("sub-123"))
                )
                .andExpect(status().isOk())
                .andExpect(view().name("home/index"))
                .andExpect(content().string(containsString("Benvenuto, sub-123")));
    }
}
