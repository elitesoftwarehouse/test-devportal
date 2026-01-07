package com.elite.portal.templates;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test di integrazione per il rendering del template Home.
 * Verifica che, con autenticazione OIDC mockata, il nome utente sia mostrato
 * correttamente nell'header e nel body. Opzionalmente, verifica la presenza/assenza
 * del link "/logout" a seconda dello stato di autenticazione.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.security.oauth2.client.registration.elite.client-id=test-client-id",
        "spring.security.oauth2.client.registration.elite.client-secret=test-client-secret",
        "spring.security.oauth2.client.registration.elite.scope=openid,profile,email",
        "spring.security.oauth2.client.registration.elite.client-name=Elite SSO",
        "spring.security.oauth2.client.registration.elite.authorization-grant-type=authorization_code",
        "spring.security.oauth2.client.registration.elite.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}",
        "spring.security.oauth2.client.provider.elite.issuer-uri=https://sso.example.test/realms/elite",
        "spring.security.oauth2.client.provider.elite.authorization-uri=https://sso.example.test/oauth2/v1/authorize",
        "spring.security.oauth2.client.provider.elite.token-uri=https://sso.example.test/oauth2/v1/token",
        "spring.security.oauth2.client.provider.elite.user-info-uri=https://sso.example.test/oauth2/v1/userinfo",
        "spring.security.oauth2.client.provider.elite.user-name-attribute=sub"
})
public class HomeTemplateIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Verifica che il template della home mostri il nome dell'utente autenticato.
     * - Esegue GET "/" con oauth2Login() impostando l'attributo name="Maria Bianchi".
     * - Attende HTTP 200.
     * - Verifica che l'HTML contenga "Ciao, Maria Bianchi" (header) e
     *   "Benvenuto, Maria Bianchi!" (body).
     * - Opzionale: verifica la presenza del link "/logout" quando autenticato.
     */
    @Test
    void shouldRenderUserNameInHeaderAndBodyWhenAuthenticated() throws Exception {
        this.mockMvc.perform(
                        get("/")
                                .with(oauth2Login().attributes(attrs -> {
                                    attrs.put("name", "Maria Bianchi");
                                    attrs.put("preferred_username", "maria.bianchi");
                                    attrs.put("sub", "user-123");
                                }))
                )
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("Ciao, Maria Bianchi")))
                .andExpect(content().string(containsString("Benvenuto, Maria Bianchi!")))
                // Opzionale: il link di logout dovrebbe essere visibile quando autenticati
                .andExpect(content().string(containsString("href=\"/logout\"")));
    }

    /**
     * Opzionale: verifica che il link "/logout" non sia presente per utenti non autenticati.
     * Se la home è pubblica: status 200 e il link non deve apparire.
     * Se la home è protetta: è accettabile un reindirizzamento o errore di autorizzazione (302/401/403).
     */
    @Test
    void shouldNotExposeLogoutLinkWhenAnonymous() throws Exception {
        MvcResult result = this.mockMvc.perform(get("/")).andReturn();
        int status = result.getResponse().getStatus();
        if (status == 200) {
            String html = result.getResponse().getContentAsString();
            assertThat(html).doesNotContain("href=\"/logout\"");
        } else {
            // Se la pagina è protetta, ci aspettiamo una redirezione al login o un errore di auth
            assertThat(status).isIn(302, 401, 403);
        }
    }
}
