package com.elite.portal.core.web;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.ui.ExtendedModelMap;
import org.springframework.ui.Model;

class HomeControllerTest {

    @Test
    void index_shouldSetDisplayName_fromOAuth2User_nameClaim() {
        HomeController controller = new HomeController();
        Model model = new ExtendedModelMap();

        Map<String, Object> attrs = new HashMap<>();
        attrs.put("name", "Mario Rossi");
        OAuth2User oAuth2User = new DefaultOAuth2User(
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")),
                attrs,
                "name");

        Authentication auth = new OAuth2AuthenticationToken(
                oAuth2User,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")),
                "login-client");

        String view = controller.index(auth, model);

        assertEquals("home/index", view);
        assertEquals("Mario Rossi", model.getAttribute("displayName"));
    }
}
