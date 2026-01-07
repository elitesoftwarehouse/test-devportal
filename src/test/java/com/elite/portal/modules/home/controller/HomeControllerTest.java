package com.elite.portal.modules.home.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

/**
 * Test di integrazione per verificare la risoluzione del displayName nella Home,
 * preferendo in ordine: name -> preferred_username -> email -> principal name.
 * Usa MockMvc con oauth2Login per simulare un utente autenticato OIDC/OAuth2.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.security.oauth2.client.registration.keycloak.client-id=test-client",
        "spring.security.oauth2.client.registration.keycloak.client-secret=test-secret",
        "spring.security.oauth2.client.registration.keycloak.client-authentication-method=client_secret_basic",
        "spring.security.oauth2.client.registration.keycloak.authorization-grant-type=authorization_code",
        "spring.security.oauth2.client.registration.keycloak.scope=openid,profile,email",
        "spring.security.oauth2.client.provider.keycloak.issuer-uri=https://example.com/auth/realms/test"
})
public class HomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void preferName_attributePresent_shouldRenderWelcomeWithNameAndView() throws Exception {
        mockMvc.perform(get("/").with(oauth2Login().attributes(attrs -> {
                    attrs.put("name", "Mario Rossi");
                    attrs.put("sub", "sub-123");
                })))
                .andExpect(status().isOk())
                .andExpect(view().name("home/index"))
                .andExpect(model().attributeExists("displayName"))
                .andExpect(model().attribute("displayName", "Mario Rossi"))
                .andExpect(content().string(containsString("Benvenuto")))
                .andExpect(content().string(containsString("Mario Rossi")));
    }

    @Test
    void preferPreferredUsername_whenNameMissing_shouldUsePreferredUsername() throws Exception {
        mockMvc.perform(get("/").with(oauth2Login().attributes(attrs -> {
                    attrs.put("preferred_username", "mrossi");
                    attrs.put("sub", "sub-456");
                })))
                .andExpect(status().isOk())
                .andExpect(view().name("home/index"))
                .andExpect(model().attributeExists("displayName"))
                .andExpect(model().attribute("displayName", "mrossi"))
                .andExpect(content().string(containsString("Benvenuto")))
                .andExpect(content().string(containsString("mrossi")));
    }

    @Test
    void preferEmail_whenNameAndPreferredUsernameMissing_shouldUseEmail() throws Exception {
        mockMvc.perform(get("/").with(oauth2Login().attributes(attrs -> {
                    attrs.put("email", "mario@example.com");
                    attrs.put("sub", "sub-789");
                })))
                .andExpect(status().isOk())
                .andExpect(view().name("home/index"))
                .andExpect(model().attributeExists("displayName"))
                .andExpect(model().attribute("displayName", "mario@example.com"))
                .andExpect(content().string(containsString("Benvenuto")))
                .andExpect(content().string(containsString("mario@example.com")));
    }

    @Test
    void fallbackPrincipalName_whenNoAttributes_shouldUsePrincipalName() throws Exception {
        mockMvc.perform(get("/").with(oauth2Login().name("sub-123")))
                .andExpect(status().isOk())
                .andExpect(view().name("home/index"))
                .andExpect(model().attributeExists("displayName"))
                .andExpect(model().attribute("displayName", "sub-123"))
                .andExpect(content().string(containsString("Benvenuto")))
                .andExpect(content().string(containsString("sub-123")));
    }
}
