package com.elite.portal.modules.home.controller;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        // Proprietà OIDC fittizie necessarie per il bootstrap del contesto in ambienti che validano la config
        "spring.security.oauth2.client.registration.oidc.client-id=portal-client-id",
        "spring.security.oauth2.client.registration.oidc.client-secret=portal-client-secret",
        "spring.security.oauth2.client.registration.oidc.scope=openid,profile,email",
        "spring.security.oauth2.client.registration.oidc.provider=oidc",
        "spring.security.oauth2.client.provider.oidc.issuer-uri=https://idp.example.com/realms/test"
})
class HomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Preferisce l'attributo name quando presente")
    void shouldPreferNameAttribute() throws Exception {
        mockMvc.perform(
                        MockMvcRequestBuilders.get("/")
                                .with(SecurityMockMvcRequestPostProcessors.oauth2Login()
                                        .attributes(attrs -> attrs.put("name", "Mario Rossi")))
                )
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.view().name("home/index"))
                .andExpect(MockMvcResultMatchers.content().string(Matchers.containsString("Benvenuto, Mario Rossi")));
    }

    @Test
    @DisplayName("Preferisce preferred_username in assenza di name")
    void shouldPreferPreferredUsernameWhenNameMissing() throws Exception {
        mockMvc.perform(
                        MockMvcRequestBuilders.get("/")
                                .with(SecurityMockMvcRequestPostProcessors.oauth2Login()
                                        .attributes(attrs -> attrs.put("preferred_username", "mrossi")))
                )
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.view().name("home/index"))
                .andExpect(MockMvcResultMatchers.content().string(Matchers.containsString("Benvenuto, mrossi")));
    }

    @Test
    @DisplayName("Preferisce email in assenza di name e preferred_username")
    void shouldPreferEmailWhenOthersMissing() throws Exception {
        mockMvc.perform(
                        MockMvcRequestBuilders.get("/")
                                .with(SecurityMockMvcRequestPostProcessors.oauth2Login()
                                        .attributes(attrs -> attrs.put("email", "mario@example.com")))
                )
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.view().name("home/index"))
                .andExpect(MockMvcResultMatchers.content().string(Matchers.containsString("Benvenuto, mario@example.com")));
    }

    @Test
    @DisplayName("Fallback al principal name quando nessun attributo è presente")
    void shouldFallbackToPrincipalName() throws Exception {
        mockMvc.perform(
                        MockMvcRequestBuilders.get("/")
                                .with(SecurityMockMvcRequestPostProcessors.oauth2Login()
                                        .name("sub-123"))
                )
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.view().name("home/index"))
                .andExpect(MockMvcResultMatchers.content().string(Matchers.containsString("Benvenuto, sub-123")));
    }
}
