package com.elite.portal.core.config;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Test di integrazione per la configurazione di sicurezza OIDC con Spring Security.
 *
 * Verifica:
 * - Utente non autenticato viene reindirizzato alla pagina di login OIDC
 * - Utente autenticato via oauth2Login accede alla home con HTTP 200
 * - Le risorse statiche non causano redirect al login (atteso 200 se esistono, altrimenti 404)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        // Proprietà fittizie per permettere il bootstrap del client OIDC
        "OIDC_CLIENT_ID=fake",
        "OIDC_CLIENT_SECRET=fake",
        "OIDC_ISSUER_URI=https://issuer.example.com",
        // Configurazione standard Spring Security OAuth2 Client (registrationId = 'company')
        "spring.security.oauth2.client.registration.company.client-id=${OIDC_CLIENT_ID}",
        "spring.security.oauth2.client.registration.company.client-secret=${OIDC_CLIENT_SECRET}",
        "spring.security.oauth2.client.registration.company.scope=openid,profile,email",
        "spring.security.oauth2.client.registration.company.authorization-grant-type=authorization_code",
        "spring.security.oauth2.client.registration.company.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}",
        "spring.security.oauth2.client.provider.company.issuer-uri=${OIDC_ISSUER_URI}",
        // Esclusione auto-configurazioni DB per evitare dipendenze da PostgreSQL/Flyway in test
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration"
})
public class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Verifica che un utente non autenticato venga reindirizzato alla pagina di login OIDC.
     */
    @Test
    @DisplayName("Non autenticato -> redirect a /oauth2/authorization/...")
    void nonAutenticato_redirectLogin() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", containsString("/oauth2/authorization")));
    }

    /**
     * Verifica che un utente autenticato con oauth2Login acceda alla home con HTTP 200.
     */
    @Test
    @DisplayName("Autenticato via oauth2Login -> accesso 200 alla home")
    void autenticato_accessoHome() throws Exception {
        mockMvc.perform(get("/").with(oauth2Login().attributes(attrs -> attrs.put("name", "Mario Rossi"))))
                .andExpect(status().isOk());
    }

    /**
     * Verifica che le risorse statiche non richiedano autenticazione: se la risorsa esiste -> 200,
     * altrimenti 404, ma in ogni caso non deve essere un redirect al login (3xx).
     */
    @Test
    @DisplayName("Risorsa statica senza auth -> 200 o 404 ma non redirect")
    void staticResource_accessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/css/app.css"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assertTrue(status == 200 || status == 404,
                            "Atteso 200 o 404 per risorsa statica, ottenuto: " + status);
                });
    }
}
