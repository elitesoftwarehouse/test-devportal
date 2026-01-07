package com.elite.portal.core.config;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test di integrazione per la configurazione di sicurezza (OIDC + Spring Security).
 *
 * - Verifica che utenti non autenticati vengano reindirizzati alla pagina di login OIDC.
 * - Verifica che utenti autenticati tramite oauth2Login possano accedere alla home "/" con HTTP 200.
 * - Verifica che una risorsa statica (o rotta fittizia) non provochi redirect al login, ma ritorni 200 o 404.
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
     * Verifica che una richiesta alla home non autenticata venga reindirizzata verso l'endpoint di autorizzazione OIDC.
     * Accetta qualsiasi redirect che contenga "/oauth2/authorization" (es. "/oauth2/authorization/company").
     */
    @Test
    void nonAutenticato_redirectLogin() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", containsString("/oauth2/authorization")));
    }

    /**
     * Verifica che un utente autenticato tramite oauth2Login possa accedere alla home con HTTP 200.
     * Imposta il registrationId a "company" per allinearsi alla configurazione tipica.
     */
    @Test
    void autenticato_accessoHome() throws Exception {
        mockMvc.perform(
                        get("/")
                                .with(oauth2Login()
                                        .clientRegistration(client -> client.registrationId("company"))
                                        .attributes(attrs -> attrs.put("name", "Mario Rossi"))
                                )
                )
                .andExpect(status().isOk());
    }

    /**
     * Verifica che le risorse statiche non siano soggette a redirect verso il login.
     * Se la risorsa esiste -> 200, se non esiste -> 404. In ogni caso NON deve essere una redirezione 3xx.
     */
    @Test
    void staticResources_accessibileONonReindirizzata() throws Exception {
        MvcResult result = mockMvc.perform(get("/css/app.css"))
                .andReturn();

        int status = result.getResponse().getStatus();
        boolean isRedirection = status >= 300 && status < 400;

        // Non deve essere un redirect al login
        Assertions.assertFalse(isRedirection, "Le risorse statiche non devono essere reindirizzate al login");

        // Deve essere 200 (se presente) oppure 404 (se non presente)
        boolean expected = status == HttpStatus.OK.value() || status == HttpStatus.NOT_FOUND.value();
        Assertions.assertTrue(expected, "Atteso 200 o 404 per le risorse statiche, ottenuto: " + status);
    }
}
