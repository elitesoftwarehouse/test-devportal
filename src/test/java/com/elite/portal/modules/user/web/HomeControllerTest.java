package com.elite.portal.modules.user.web;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.ui.Model;

class HomeControllerTest {

    private HomeController controller;

    @BeforeEach
    void setup() {
        controller = new HomeController();
    }

    @Test
    void index_withOidcUser_usesNameClaim() {
        // Arrange: costruisci un OIDC user con claim name
        Map<String, Object> idClaims = new HashMap<>();
        idClaims.put("sub", "123");
        OidcIdToken idToken = new OidcIdToken("token", Instant.now(), Instant.now().plusSeconds(3600), idClaims);

        Map<String, Object> uiClaims = new HashMap<>();
        uiClaims.put("name", "Mario Rossi");
        uiClaims.put("given_name", "Mario");
        uiClaims.put("family_name", "Rossi");
        OidcUserInfo userInfo = new OidcUserInfo(uiClaims);

        OidcUser oidcUser = new DefaultOidcUser(Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")), idToken, userInfo);

        Model model = new ExtendedModelMap();

        // Act
        String view = controller.index(model, oidcUser, new TestingAuthenticationToken(oidcUser, null));

        // Assert
        assertEquals("home/index", view);
        Object displayName = model.getAttribute("displayName");
        assertNotNull(displayName);
        assertEquals("Mario Rossi", displayName);
    }

    @Test
    void index_withoutPrincipal_fallsBackToAuthenticationName() {
        // Arrange
        Model model = new ExtendedModelMap();
        TestingAuthenticationToken auth = new TestingAuthenticationToken("user", "n/a");

        // Act
        String view = controller.index(model, null, auth);

        // Assert
        assertEquals("home/index", view);
        assertEquals("user", model.getAttribute("displayName"));
    }
}
