package com.elite.portal.modules.home.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.ui.Model;

class HomeControllerTest {

    private final HomeController controller = new HomeController();

    @Test
    void index_withOidcUser_fullName() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "123");
        claims.put("name", "Mario Rossi");
        claims.put("email", "mario.rossi@example.com");

        OidcUser oidcUser = buildOidcUser(claims);

        Model model = new ExtendedModelMap();
        String view = controller.index(model, oidcUser);

        assertThat(view).isEqualTo("home/index");
        assertThat(model.getAttribute("displayName")).isEqualTo("Mario Rossi");
    }

    @Test
    void index_withOidcUser_emailFallback() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("sub", "abc");
        claims.put("email", "utente@example.com");

        OidcUser oidcUser = buildOidcUser(claims);

        Model model = new ExtendedModelMap();
        String view = controller.index(model, oidcUser);

        assertThat(view).isEqualTo("home/index");
        assertThat(model.getAttribute("displayName")).isEqualTo("utente@example.com");
    }

    @Test
    void index_withOAuth2User_preferredUsernameFallback() {
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("preferred_username", "m.rossi");
        // intentionally no "name" and no "email"

        OAuth2User oauth2User = new DefaultOAuth2User(
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")),
                attributes,
                "preferred_username");

        Model model = new ExtendedModelMap();
        String view = controller.index(model, oauth2User);

        assertThat(view).isEqualTo("home/index");
        assertThat(model.getAttribute("displayName")).isEqualTo("m.rossi");
    }

    @Test
    void index_withNullPrincipal_usesGenericFallback() {
        Model model = new ExtendedModelMap();
        String view = controller.index(model, null);

        assertThat(view).isEqualTo("home/index");
        assertThat(model.getAttribute("displayName")).isEqualTo("Utente");
    }

    private OidcUser buildOidcUser(Map<String, Object> claims) {
        OidcIdToken idToken = new OidcIdToken(
                "id-token",
                Instant.now().minusSeconds(60),
                Instant.now().plusSeconds(600),
                claims
        );
        OidcUserInfo userInfo = new OidcUserInfo(claims);
        return new DefaultOidcUser(
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")),
                idToken,
                userInfo,
                "sub"
        );
    }
}
