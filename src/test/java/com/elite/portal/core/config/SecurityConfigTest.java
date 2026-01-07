package com.elite.portal.core.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.oauth2.client.InMemoryOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = {SecurityConfig.class, SecurityConfigTest.TestApp.class, SecurityConfigTest.TestOAuth2Beans.class})
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void staticResourcesAreAccessibleWithoutAuthentication() throws Exception {
        mockMvc.perform(get("/css/app.css"))
                .andExpect(status().isNotFound()); // Permesso dalla security, ma la risorsa non esiste -> 404 (non redirect)
    }

    @Test
    void anyOtherRequestRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", containsString("/oauth2/authorization")));
    }

    @Test
    void csrfIsEnabledByDefault() throws Exception {
        mockMvc.perform(post("/"))
                .andExpect(status().isForbidden());
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration
    static class TestApp {
        // Configurazione minima Boot per eseguire il contesto durante i test
    }

    @Configuration
    static class TestOAuth2Beans {

        @Bean
        @Primary
        ClientRegistrationRepository clientRegistrationRepository() {
            ClientRegistration registration = ClientRegistration.withRegistrationId("test")
                    .clientId("test-client-id")
                    .clientSecret("test-client-secret")
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                    .scope("openid", "profile", "email")
                    .authorizationUri("https://example.com/oauth2/authorize")
                    .tokenUri("https://example.com/oauth2/token")
                    .userInfoUri("https://example.com/userinfo")
                    .userNameAttributeName("sub")
                    .jwkSetUri("https://example.com/.well-known/jwks.json")
                    .build();
            return new InMemoryClientRegistrationRepository(registration);
        }

        @Bean
        @Primary
        OAuth2AuthorizedClientService authorizedClientService(ClientRegistrationRepository repo) {
            return new InMemoryOAuth2AuthorizedClientService(repo);
        }
    }
}
