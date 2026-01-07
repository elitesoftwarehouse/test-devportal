package com.elite.portal.modules.home.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.ui.Model;

class HomeControllerTest {

    @Test
    @DisplayName("Dovrebbe restituire view 'home/index' e displayName da OIDC claim 'name'")
    void index_withOidcUser_nameClaim() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        OidcUser oidcUser = mock(OidcUser.class);
        Map<String, Object> claims = new HashMap<>();
        claims.put("name", "Mario Rossi");
        when(oidcUser.getClaims()).thenReturn(claims);
        when(oidcUser.getName()).thenReturn("sub-123");

        String view = controller.index(model, oidcUser);

        assertEquals("home/index", view);
        assertEquals("Mario Rossi", model.getAttribute("displayName"));
    }

    @Test
    @DisplayName("Dovrebbe usare 'preferred_username' da OAuth2 attributes se presente")
    void index_withOAuth2User_preferredUsername() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        OAuth2User oauth2User = mock(OAuth2User.class);
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("preferred_username", "mario.rossi");
        when(oauth2User.getAttributes()).thenReturn(attributes);
        when(oauth2User.getName()).thenReturn("id-456");

        String view = controller.index(model, oauth2User);

        assertEquals("home/index", view);
        assertEquals("mario.rossi", model.getAttribute("displayName"));
    }

    @Test
    @DisplayName("Dovrebbe fare fallback su OAuth2User.getName() quando gli attributi non contengono nome")
    void index_withOAuth2User_fallbackToGetName() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        OAuth2User oauth2User = mock(OAuth2User.class);
        when(oauth2User.getAttributes()).thenReturn(Collections.emptyMap());
        when(oauth2User.getName()).thenReturn("id-789");

        String view = controller.index(model, oauth2User);

        assertEquals("home/index", view);
        assertEquals("id-789", model.getAttribute("displayName"));
    }

    @Test
    @DisplayName("Dovrebbe gestire principal nullo restituendo displayName vuoto")
    void index_withNullPrincipal() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        String view = controller.index(model, null);

        assertEquals("home/index", view);
        assertEquals("", model.getAttribute("displayName"));
    }
}
