package com.elite.portal.templates;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oauth2Login;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test di integrazione per la home page.
 * Verifica che, con autenticazione OIDC simulata, il template contenga il nome dell'utente
 * sia nell'header ("Ciao, <nome>") sia nel body ("Benvenuto, <nome>!") e che sia presente il link "/logout".
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.thymeleaf.cache=false",
        // Proprietà OIDC fittizie per permettere l'avvio del contesto
        "spring.security.oauth2.client.registration.portal.client-id=portal-client",
        "spring.security.oauth2.client.registration.portal.client-secret=portal-secret",
        "spring.security.oauth2.client.registration.portal.scope=openid,profile,email",
        "spring.security.oauth2.client.registration.portal.authorization-grant-type=authorization_code",
        "spring.security.oauth2.client.registration.portal.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}",
        "spring.security.oauth2.client.provider.portal.issuer-uri=https://idp.example.com/realms/test",
        // Risorsa server fittizia (se configurata)
        "spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://idp.example.com/realms/test/protocol/openid-connect/certs"
})
public class HomeTemplateIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    /**
     * Esegue una GET su "/" con autenticazione oauth2Login simulata e attributo name="Maria Bianchi".
     * Verifica status 200, la presenza di "Ciao, Maria Bianchi" e "Benvenuto, Maria Bianchi!" nell'HTML
     * e la presenza del link "/logout" quando autenticato.
     */
    @Test
    void shouldRenderHomeTemplateWithUserNameInHeaderAndBody() throws Exception {
        ResultActions result = this.mockMvc.perform(
                        get("/").with(oauth2Login().attributes(attrs -> attrs.put("name", "Maria Bianchi")))
                )
                .andDo(print());

        result.andExpect(status().isOk())
                .andExpect(content().string(containsString("Ciao, Maria Bianchi")))
                .andExpect(content().string(containsString("Benvenuto, Maria Bianchi!")))
                .andExpect(content().string(containsString("/logout")));
    }

    /**
     * Opzionale: verifica che, se non autenticato, l'accesso a "/" non mostri il contenuto previsto e
     * normalmente porti a una redirezione verso il provider di login (a seconda della configurazione).
     * Questa verifica conferma indirettamente che il link "/logout" è disponibile solo dopo autenticazione.
     */
    @Test
    void whenAnonymous_thenRedirectToLogin() throws Exception {
        this.mockMvc.perform(get("/"))
                .andDo(print())
                .andExpect(status().is3xxRedirection());
    }
}
