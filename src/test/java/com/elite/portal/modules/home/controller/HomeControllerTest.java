package com.elite.portal.modules.home.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.ui.Model;

import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;

public class HomeControllerTest {

    @Test
    void index_withOidcUser_fullName() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        OidcUser oidcUser = Mockito.mock(OidcUser.class);
        Mockito.when(oidcUser.getFullName()).thenReturn("Mario Rossi");

        String view = controller.index(model, oidcUser);

        assertEquals("home/index", view);
        assertEquals("Mario Rossi", model.getAttribute("displayName"));
    }

    @Test
    void index_withOidcUser_nameClaim() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        OidcUser oidcUser = Mockito.mock(OidcUser.class);
        Mockito.when(oidcUser.getFullName()).thenReturn(null);
        Map<String, Object> claims = new HashMap<>();
        claims.put("name", "Claudio Verdi");
        Mockito.when(oidcUser.getClaims()).thenReturn(claims);
        Mockito.when(oidcUser.getEmail()).thenReturn(null);
        Mockito.when(oidcUser.getPreferredUsername()).thenReturn(null);

        String view = controller.index(model, oidcUser);

        assertEquals("home/index", view);
        assertEquals("Claudio Verdi", model.getAttribute("displayName"));
    }

    @Test
    void index_withOidcUser_emailFallback() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        OidcUser oidcUser = Mockito.mock(OidcUser.class);
        Mockito.when(oidcUser.getFullName()).thenReturn(null);
        Mockito.when(oidcUser.getClaims()).thenReturn(Collections.emptyMap());
        Mockito.when(oidcUser.getEmail()).thenReturn("user@example.com");
        Mockito.when(oidcUser.getPreferredUsername()).thenReturn(null);

        String view = controller.index(model, oidcUser);

        assertEquals("home/index", view);
        assertEquals("user@example.com", model.getAttribute("displayName"));
    }

    @Test
    void index_withOidcUser_preferredUsernameFallback() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        OidcUser oidcUser = Mockito.mock(OidcUser.class);
        Mockito.when(oidcUser.getFullName()).thenReturn(null);
        Mockito.when(oidcUser.getClaims()).thenReturn(Collections.emptyMap());
        Mockito.when(oidcUser.getEmail()).thenReturn(null);
        Mockito.when(oidcUser.getPreferredUsername()).thenReturn("user123");

        String view = controller.index(model, oidcUser);

        assertEquals("home/index", view);
        assertEquals("user123", model.getAttribute("displayName"));
    }

    @Test
    void index_withOAuth2User_attributesName() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        OAuth2User oauth2User = Mockito.mock(OAuth2User.class);
        Map<String, Object> attrs = new HashMap<>();
        attrs.put("name", "Giulia Neri");
        Mockito.when(oauth2User.getAttributes()).thenReturn(attrs);
        Mockito.when(oauth2User.getName()).thenReturn("id-ignored");

        String view = controller.index(model, oauth2User);

        assertEquals("home/index", view);
        assertEquals("Giulia Neri", model.getAttribute("displayName"));
    }

    @Test
    void index_withOAuth2User_preferredUsername() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        OAuth2User oauth2User = Mockito.mock(OAuth2User.class);
        Map<String, Object> attrs = new HashMap<>();
        attrs.put("preferred_username", "g.neri");
        Mockito.when(oauth2User.getAttributes()).thenReturn(attrs);
        Mockito.when(oauth2User.getName()).thenReturn("id-ignored");

        String view = controller.index(model, oauth2User);

        assertEquals("home/index", view);
        assertEquals("g.neri", model.getAttribute("displayName"));
    }

    @Test
    void index_withOAuth2User_email() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        OAuth2User oauth2User = Mockito.mock(OAuth2User.class);
        Map<String, Object> attrs = new HashMap<>();
        attrs.put("email", "giulia.neri@example.com");
        Mockito.when(oauth2User.getAttributes()).thenReturn(attrs);
        Mockito.when(oauth2User.getName()).thenReturn("id-ignored");

        String view = controller.index(model, oauth2User);

        assertEquals("home/index", view);
        assertEquals("giulia.neri@example.com", model.getAttribute("displayName"));
    }

    @Test
    void index_withOAuth2User_fallbackGetName() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        OAuth2User oauth2User = Mockito.mock(OAuth2User.class);
        Mockito.when(oauth2User.getAttributes()).thenReturn(Collections.emptyMap());
        Mockito.when(oauth2User.getName()).thenReturn("principal-id-42");

        String view = controller.index(model, oauth2User);

        assertEquals("home/index", view);
        assertEquals("principal-id-42", model.getAttribute("displayName"));
    }

    @Test
    void index_withNullPrincipal_setsEmptyDisplayName() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        String view = controller.index(model, null);

        assertEquals("home/index", view);
        assertEquals("", model.getAttribute("displayName"));
    }
}
