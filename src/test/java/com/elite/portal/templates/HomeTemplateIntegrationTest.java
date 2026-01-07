package com.elite.portal.templates;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test di integrazione per il rendering del template Home.
 * Verifica che, con autenticazione OIDC, il nome utente sia mostrato nell'header e nel body.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.security.oauth2.client.registration.elite.client-id=elite-test",
        "spring.security.oauth2.client.registration.elite.client-secret=secret",
        "spring.security.oauth2.client.registration.elite.client-name=Elite",
        "spring.security.oauth2.client.registration.elite.provider=elite",
        "spring.security.oauth2.client.registration.elite.scope=openid,profile,email",
        "spring.security.oauth2.client.registration.elite.authorization-grant-type=authorization_code",
        "spring.security.oauth2.client.registration.elite.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}",
        "spring.security.oauth2.client.provider.elite.issuer-uri=https://issuer.test/realms/elite"
})
public class HomeTemplateIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Esegue una GET su "/" con autenticazione OIDC simulata e verifica:
     * - Status 200 OK;
     * - Presenza della stringa "Ciao, Maria Bianchi" (header);
     * - Presenza della stringa "Benvenuto, Maria Bianchi!" (body);
     * - Opzionale: presenza del link "/logout" quando autenticato.
     */
    @Test
    @DisplayName("Home: visualizzazione nome utente in header e body con OIDC e presenza logout")
    void shouldRenderUserNameInHeaderAndBody_whenAuthenticatedWithOidc() throws Exception {
        mockMvc.perform(get("/")
                        .with(oauth2Login().attributes(attrs -> attrs.put("name", "Maria Bianchi"))))
                .andExpect(status().isOk())
                .andExpect(content().string(Matchers.containsString("Ciao, Maria Bianchi")))
                .andExpect(content().string(Matchers.containsString("Benvenuto, Maria Bianchi!")))
                // Opzionale: il link di logout dovrebbe essere visibile se l'utente è autenticato
                .andExpect(content().string(Matchers.containsString("href=\"/logout\"")));
    }
}
