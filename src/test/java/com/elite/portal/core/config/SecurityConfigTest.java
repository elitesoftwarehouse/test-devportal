package com.elite.portal.core.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.client.InMemoryOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = {})
@Import({SecurityConfig.class, SecurityConfigTest.TestSecurityBeans.class})
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Le risorse statiche sono consentite senza autenticazione")
    void staticResourcesArePermitted() throws Exception {
        // Anche se la risorsa non esiste, non deve fare redirect al login; ci aspettiamo 404
        mockMvc.perform(get("/css/app.css"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Le richieste non autenticate vengono reindirizzate alla pagina di login OIDC")
    void unauthenticatedRequestsRedirectToOidcLogin() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("/oauth2/authorization/test")));
    }

    @Test
    @WithMockUser
    @DisplayName("Le richieste autenticate possono accedere (se il mapping non esiste, 404)")
    void authenticatedRequestAllowed() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    @DisplayName("Logout reindirizza alla home con CSRF abilitato")
    void logoutRedirectsToHome() throws Exception {
        mockMvc.perform(post("/logout").with(csrf()))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", "/"));
    }

    @TestConfiguration
    static class TestSecurityBeans {
        @Bean
        ClientRegistrationRepository clientRegistrationRepository() {
            ClientRegistration registration = ClientRegistration.withRegistrationId("test")
                    .clientId("test-client-id")
                    .clientSecret("test-client-secret")
                    .clientName("Test")
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                    .scope("openid", "profile", "email")
                    .authorizationUri("https://example.com/oauth2/authorize")
                    .tokenUri("https://example.com/oauth2/token")
                    .userInfoUri("https://example.com/oauth2/userinfo")
                    .userNameAttributeName("sub")
                    .jwkSetUri("https://example.com/oauth2/jwks")
                    .build();
            return new InMemoryClientRegistrationRepository(registration);
        }

        @Bean
        OAuth2AuthorizedClientService authorizedClientService(ClientRegistrationRepository repo) {
            return new InMemoryOAuth2AuthorizedClientService(repo);
        }
    }
}
