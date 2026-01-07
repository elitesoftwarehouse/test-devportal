package com.elite.portal.modules.user.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.StandardClaimNames;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.ui.ConcurrentModel;
import org.springframework.ui.Model;

public class HomeControllerTest {

    @Test
    void indexAddsDisplayNameFromOidcUser() {
        HomeController controller = new HomeController();
        Model model = new ConcurrentModel();

        Map<String, Object> claims = new HashMap<>();
        claims.put(StandardClaimNames.NAME, "Mario Rossi");
        OidcIdToken idToken = new OidcIdToken("token", Instant.now(), Instant.now().plusSeconds(3600), claims);
        DefaultOidcUser user = new DefaultOidcUser(null, idToken);

        String view = controller.index(model, user);

        assertThat(view).isEqualTo("home/index");
        assertThat(model.getAttribute("displayName")).isEqualTo("Mario Rossi");
    }

    @Test
    void indexAddsEmptyDisplayNameWhenUserNull() {
        HomeController controller = new HomeController();
        Model model = new ConcurrentModel();

        String view = controller.index(model, null);

        assertThat(view).isEqualTo("home/index");
        assertThat(model.getAttribute("displayName")).isEqualTo("");
    }

    @Test
    void resolveDisplayNameFallsBackToPreferredUsername() {
        Map<String, Object> claims = new HashMap<>();
        claims.put(StandardClaimNames.PREFERRED_USERNAME, "mrossi");
        OidcIdToken idToken = new OidcIdToken("token", Instant.now(), Instant.now().plusSeconds(3600), claims);
        DefaultOidcUser user = new DefaultOidcUser(null, idToken);

        String name = HomeController.resolveDisplayName(user);

        assertThat(name).isEqualTo("mrossi");
    }
}
