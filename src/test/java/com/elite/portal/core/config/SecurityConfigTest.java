package com.elite.portal.core.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test di integrazione per verificare la configurazione di sicurezza OIDC.
 * - Verifica che un utente non autenticato venga reindirizzato al login OIDC.
 * - Verifica che un utente autenticato con oauth2Login possa accedere alla home con HTTP 200.
 * - Verifica che le risorse statiche non autentichino (404 e non 302) quando la risorsa non esiste.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "OIDC_CLIENT_ID=fake",
        "OIDC_CLIENT_SECRET=fake",
        "OIDC_ISSUER_URI=https://issuer.example.com"
})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Un utente non autenticato che accede alla root deve essere reindirizzato alla pagina di login OIDC.
     */
    @Test
    void nonAutenticato_redirectLogin() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().is3xxRedirection())
                // Generalmente Spring Security reindirizza verso /oauth2/authorization/{registrationId}
                .andExpect(header().string("Location", containsString("/oauth2/authorization")));
    }

    /**
     * Un utente autenticato tramite oauth2Login deve poter accedere alla home con HTTP 200.
     */
    @Test
    void autenticato_accessoHome() throws Exception {
        mockMvc.perform(get("/").with(oauth2Login().attributes(attrs -> attrs.put("name", "Mario Rossi"))))
                .andExpect(status().isOk());
    }

    /**
     * Le risorse statiche dovrebbero essere servite senza forzare l'autenticazione. Per una risorsa inesistente,
     * ci si aspetta 404 e non un redirect 302 verso il login.
     */
    @Test
    void statiche_accessibili_senza_redirect() throws Exception {
        mockMvc.perform(get("/css/does-not-exist.css"))
                .andExpect(status().isNotFound());
    }
}
