package com.elite.portal.core.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Test di integrazione per verificare che la configurazione OAuth2 Client
 * per la registrazione "company" venga caricata correttamente dal contesto Spring.
 *
 * Nota: in questo test evitiamo la discovery OIDC via issuer-uri per non
 * eseguire chiamate di rete; forniamo esplicitamente gli endpoint provider.
 */
@SpringBootTest(classes = OidcClientConfigurationTest.TestConfig.class)
@TestPropertySource(properties = {
        // Registrazione del client "company"
        "spring.security.oauth2.client.registration.company.client-id=test-client",
        "spring.security.oauth2.client.registration.company.client-secret=test-secret",
        "spring.security.oauth2.client.registration.company.scope=openid,profile,email",
        "spring.security.oauth2.client.registration.company.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}",
        "spring.security.oauth2.client.registration.company.authorization-grant-type=authorization_code",
        "spring.security.oauth2.client.registration.company.client-name=Company",
        // Usa un provider custom per evitare discovery via issuer-uri
        "spring.security.oauth2.client.registration.company.provider=company-test",
        "spring.security.oauth2.client.provider.company-test.authorization-uri=https://issuer.example.com/oauth2/v1/authorize",
        "spring.security.oauth2.client.provider.company-test.token-uri=https://issuer.example.com/oauth2/v1/token",
        "spring.security.oauth2.client.provider.company-test.jwk-set-uri=https://issuer.example.com/oauth2/v1/keys",
        "spring.security.oauth2.client.provider.company-test.user-info-uri=https://issuer.example.com/oauth2/v1/userinfo",
        "spring.security.oauth2.client.provider.company-test.user-name-attribute=sub"
})
public class OidcClientConfigurationTest {

    @SpringBootConfiguration
    @EnableAutoConfiguration
    static class TestConfig {
        // Configurazione minimale per avviare il contesto con l'auto-configurazione
    }

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    @Test
    void companyClientRegistrationIsLoaded() {
        ClientRegistration reg = clientRegistrationRepository.findByRegistrationId("company");
        assertNotNull(reg, "ClientRegistration 'company' dovrebbe essere presente");
        assertEquals("test-client", reg.getClientId());
        assertEquals("test-secret", reg.getClientSecret());
        assertEquals("authorization_code", reg.getAuthorizationGrantType().getValue());
        assertEquals("{baseUrl}/login/oauth2/code/{registrationId}", reg.getRedirectUri());
        assertTrue(reg.getScopes().contains("openid"));
        assertTrue(reg.getScopes().contains("profile"));
        assertTrue(reg.getScopes().contains("email"));
        assertEquals("Company", reg.getClientName());
        // Verifica che gli endpoint provider siano stati applicati (no discovery)
        assertNotNull(reg.getProviderDetails().getAuthorizationUri());
        assertNotNull(reg.getProviderDetails().getTokenUri());
        assertNotNull(reg.getProviderDetails().getJwkSetUri());
    }
}
