package com.elite.portal.core.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = OidcClientConfigurationTest.TestApp.class)
class OidcClientConfigurationTest {

    @SpringBootConfiguration
    @EnableAutoConfiguration
    static class TestApp {
        // Configurazione minima per avviare il contesto
    }

    @DynamicPropertySource
    static void registerEnvPlaceholders(DynamicPropertyRegistry registry) {
        registry.add("OIDC_CLIENT_ID", () -> "test-client");
        registry.add("OIDC_CLIENT_SECRET", () -> "test-secret");
        registry.add("OIDC_ISSUER_URI", () -> "https://issuer.example.com/");
        registry.add("SERVER_PORT", () -> "0"); // usa una porta casuale in test
    }

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    @Test
    void companyRegistrationLoadedWithExpectedProperties() {
        assertNotNull(clientRegistrationRepository, "ClientRegistrationRepository deve essere disponibile");
        InMemoryClientRegistrationRepository inMemoryRepo = (InMemoryClientRegistrationRepository) clientRegistrationRepository;
        ClientRegistration registration = inMemoryRepo.findByRegistrationId("company");

        assertNotNull(registration, "La registration 'company' deve essere configurata");
        assertEquals("test-client", registration.getClientId(), "client-id non corrisponde");
        assertEquals("test-secret", registration.getClientSecret(), "client-secret non corrisponde");
        assertTrue(registration.getScopes().contains("openid"), "scope openid mancante");
        assertTrue(registration.getScopes().contains("profile"), "scope profile mancante");
        assertTrue(registration.getScopes().contains("email"), "scope email mancante");
        assertEquals("{baseUrl}/login/oauth2/code/{registrationId}", registration.getRedirectUri(), "redirect-uri non corrisponde");
        // Verifica che i dettagli provider siano valorizzati (derivabili dall'issuer)
        assertNotNull(registration.getProviderDetails().getAuthorizationUri(), "authorizationUri dovrebbe essere valorizzato");
        assertNotNull(registration.getProviderDetails().getTokenUri(), "tokenUri dovrebbe essere valorizzato");
        assertNotNull(registration.getProviderDetails().getJwkSetUri(), "jwkSetUri dovrebbe essere valorizzato");
    }
}
