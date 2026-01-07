package com.elite.portal.core.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.client.InMemoryOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.test.web.servlet.MockMvc;

import javax.annotation.Resource;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Import(SecurityConfigTest.OAuth2TestConfig.class)
class SecurityConfigTest {

    @Resource
    private MockMvc mockMvc;

    @Test
    void shouldPermitStaticResourcesWithoutAuthentication() throws Exception {
        // Nessuna risorsa statica reale: ci aspettiamo 404, ma non un redirect a login (quindi il permitAll è effettivo)
        mockMvc.perform(get("/css/app.css"))
            .andExpect(status().isNotFound());
    }

    @Test
    void shouldRequireAuthenticationForOtherRequestsAndRedirectToOAuth2() throws Exception {
        mockMvc.perform(get("/"))
            .andExpect(status().isFound())
            .andExpect(header().exists("Location"))
            .andExpect(redirectedUrl("/oauth2/authorization/test"));
    }

    @Test
    void shouldConfigureLogoutToRedirectToRoot() throws Exception {
        mockMvc.perform(post("/logout").with(csrf()))
            .andExpect(status().isFound())
            .andExpect(redirectedUrl("/"));
    }

    @Configuration
    static class OAuth2TestConfig {
        @Bean
        ClientRegistrationRepository clientRegistrationRepository() {
            ClientRegistration registration = ClientRegistration.withRegistrationId("test")
                .clientId("client")
                .clientSecret("secret")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .scope("openid")
                .authorizationUri("https://example.com/oauth/authorize")
                .tokenUri("https://example.com/oauth/token")
                .jwkSetUri("https://example.com/.well-known/jwks.json")
                .userInfoUri("https://example.com/userinfo")
                .userNameAttributeName("sub")
                .clientName("Test")
                .build();
            return new InMemoryClientRegistrationRepository(registration);
        }

        @Bean
        OAuth2AuthorizedClientService authorizedClientService(ClientRegistrationRepository repo) {
            return new InMemoryOAuth2AuthorizedClientService(repo);
        }
    }
}
