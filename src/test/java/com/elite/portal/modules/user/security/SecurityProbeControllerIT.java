package com.elite.portal.modules.user.security;

import com.elite.portal.core.security.RestAccessDeniedHandler;
import com.elite.portal.core.security.RestAuthenticationEntryPoint;
import com.elite.portal.core.security.SecurityProbeController;
import com.elite.portal.core.security.jwt.JwtTestUtils;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integrazione end-to-end per la validazione JWT lato Resource Server usando
 * issuer OIDC e JWKS mockati via WireMock.
 *
 * Scenari coperti:
 * 1. /api/public/ping -> 200 senza token
 * 2. /api/secure/ping senza token -> 401 con JSON RestAuthenticationEntryPoint
 * 3. /api/secure/ping con token firmato da chiave non presente nel JWKS -> 401
 * 4. /api/secure/ping con token valido ma senza scope -> 403 con JSON RestAccessDeniedHandler
 * 5. /api/secure/ping con token valido e scope api.read -> 200
 * 6. /api/secure/echo con token valido e scope api.write -> 200
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(Lifecycle.PER_CLASS)
class SecurityProbeControllerIT {

    @Autowired
    private MockMvc mockMvc;

    private static WireMockServer wireMockServer;

    private static String issuer;

    private static KeyPair jwksKeyPair;

    private static String jwksJson;

    @DynamicPropertySource
    static void configureIssuer(DynamicPropertyRegistry registry) {
        registry.add("spring.security.oauth2.resourceserver.jwt.issuer-uri", () -> issuer);
    }

    @BeforeAll
    void setUpAll() throws Exception {
        jwksKeyPair = generateRsaKeyPair();
        wireMockServer = new WireMockServer(WireMockConfiguration.options().dynamicPort());
        wireMockServer.start();
        WireMock.configureFor("localhost", wireMockServer.port());

        issuer = "http://localhost:" + wireMockServer.port() + "/issuer";
        String jwksUri = issuer + "/jwks";

        jwksJson = JwtTestUtils.buildJwksForPublicKey(jwksKeyPair.getPublic(), "test-key-id");

        String openIdConfigurationJson = "{" +
                "\"issuer\":\"" + issuer + "\"," +
                "\"jwks_uri\":\"" + jwksUri + "\"" +
                "}";

        wireMockServer.stubFor(get("/issuer/.well-known/openid-configuration")
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(openIdConfigurationJson)));

        wireMockServer.stubFor(get("/issuer/jwks")
                .willReturn(aResponse()
                        .withStatus(200)
                        .withHeader("Content-Type", "application/json")
                        .withBody(jwksJson)));
    }

    @AfterAll
    void tearDownAll() {
        if (wireMockServer != null) {
            wireMockServer.stop();
        }
    }

    @BeforeEach
    void beforeEach() {
        wireMockServer.resetRequests();
    }

    @AfterEach
    void afterEach() {
        // no-op; lasciato per simmetria e possibili estensioni future
    }

    @Test
    @DisplayName("GET /api/public/ping - 200 senza token")
    void publicPingShouldReturnOkWithoutToken() throws Exception {
        mockMvc.perform(get("/api/public/ping"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/secure/ping senza token - 401 JSON RestAuthenticationEntryPoint")
    void securePingWithoutTokenShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/secure/ping"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error").value("unauthorized"));
    }

    @Test
    @DisplayName("GET /api/secure/ping con token firmato da chiave non nel JWKS - 401")
    void securePingWithTokenSignedByUnknownKeyShouldReturn401() throws Exception {
        KeyPair otherKeyPair = generateRsaKeyPair();
        String token = JwtTestUtils.buildJwt(otherKeyPair.getPrivate(), issuer, "api-client", Collections.singletonList("api.read"));

        mockMvc.perform(get("/api/secure/ping")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error").value("unauthorized"));
    }

    @Test
    @DisplayName("GET /api/secure/ping con token valido ma senza scope - 403 JSON RestAccessDeniedHandler")
    void securePingWithValidTokenWithoutScopeShouldReturn403() throws Exception {
        String token = JwtTestUtils.buildJwt(jwksKeyPair.getPrivate(), issuer, "api-client", Collections.emptyList());

        mockMvc.perform(get("/api/secure/ping")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error").value("forbidden"));
    }

    @Test
    @DisplayName("GET /api/secure/ping con token valido e scope api.read - 200")
    void securePingWithValidTokenAndReadScopeShouldReturn200() throws Exception {
        String token = JwtTestUtils.buildJwt(jwksKeyPair.getPrivate(), issuer, "api-client", Collections.singletonList("api.read"));

        mockMvc.perform(get("/api/secure/ping")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/secure/echo con token valido e scope api.write - 200")
    void secureEchoWithValidTokenAndWriteScopeShouldReturn200() throws Exception {
        String token = JwtTestUtils.buildJwt(jwksKeyPair.getPrivate(), issuer, "api-client", Collections.singletonList("api.write"));

        mockMvc.perform(post("/api/secure/echo")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"hello\"}"))
                .andExpect(status().isOk());
    }

    /**
     * Genera una coppia di chiavi RSA 2048 bit per i test.
     *
     * @return KeyPair RSA
     * @throws NoSuchAlgorithmException se l'algoritmo RSA non è disponibile
     */
    private static KeyPair generateRsaKeyPair() throws NoSuchAlgorithmException {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        return keyPairGenerator.generateKeyPair();
    }
}
