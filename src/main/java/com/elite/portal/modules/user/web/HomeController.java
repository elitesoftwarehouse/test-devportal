package com.elite.portal.modules.user.web;

import java.security.Principal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller responsabile della home page.
 * Popola l'attributo displayName partendo dalle informazioni del principal OIDC/OAuth2,
 * con fallback al nome dell'Authentication.
 */
@Controller
public class HomeController {

    /**
     * Gestisce la root "/" e restituisce la vista home/index.
     *
     * @param model          il model per la view
     * @param principal      l'utente autenticato (OIDC/OAuth2/UserDetails/etc.)
     * @param authentication il contesto di autenticazione corrente
     * @return il nome della view Thymeleaf
     */
    @GetMapping("/")
    public String index(Model model,
                        @AuthenticationPrincipal Object principal,
                        Authentication authentication) {
        String displayName = resolveDisplayName(principal, authentication);
        model.addAttribute("displayName", displayName);
        return "home/index";
    }

    /**
     * Risolve un display name leggibile dall'oggetto principal e, in caso non sia disponibile,
     * effettua fallback al nome presente nell'Authentication.
     *
     * @param principal      principal autenticato (puo' essere OidcUser, OAuth2User, UserDetails, ecc.)
     * @param authentication authentication corrente per eventuale fallback del nome
     * @return un nome visualizzabile, eventualmente vuoto se non disponibile
     */
    String resolveDisplayName(Object principal, Authentication authentication) {
        String name = null;

        if (principal instanceof OidcUser) {
            OidcUser oidcUser = (OidcUser) principal;
            OidcUserInfo userInfo = oidcUser.getUserInfo();
            if (userInfo != null) {
                // Prova il claim standard "name"
                name = userInfo.getName();
                if (!StringUtils.hasText(name)) {
                    String given = userInfo.getGivenName();
                    String family = userInfo.getFamilyName();
                    String combined = combineNames(given, family);
                    if (StringUtils.hasText(combined)) {
                        name = combined;
                    }
                }
            }
            if (!StringUtils.hasText(name)) {
                // Fallback su attributi grezzi
                Object attrName = oidcUser.getAttributes().get("name");
                if (attrName instanceof String && StringUtils.hasText((String) attrName)) {
                    name = (String) attrName;
                } else {
                    String given = asString(oidcUser.getAttributes().get("given_name"));
                    String family = asString(oidcUser.getAttributes().get("family_name"));
                    String combined = combineNames(given, family);
                    if (StringUtils.hasText(combined)) {
                        name = combined;
                    }
                }
            }
            if (!StringUtils.hasText(name)) {
                name = oidcUser.getName(); // come ultimo tentativo, ritorna l'identificativo
            }
        } else if (principal instanceof OAuth2User) {
            OAuth2User oauth = (OAuth2User) principal;
            Object attrName = oauth.getAttributes().get("name");
            if (attrName instanceof String && StringUtils.hasText((String) attrName)) {
                name = (String) attrName;
            }
            if (!StringUtils.hasText(name)) {
                name = oauth.getName();
            }
        } else if (principal instanceof UserDetails) {
            name = ((UserDetails) principal).getUsername();
        } else if (principal instanceof Principal) {
            name = ((Principal) principal).getName();
        } else if (principal instanceof String) {
            name = (String) principal;
        }

        if (!StringUtils.hasText(name) && authentication != null) {
            name = authentication.getName();
        }

        return name != null ? name.trim() : "";
    }

    private String asString(Object value) {
        return value instanceof String ? (String) value : null;
    }

    private String combineNames(String given, String family) {
        Collection<String> parts = new ArrayList<>();
        if (StringUtils.hasText(given)) {
            parts.add(given.trim());
        }
        if (StringUtils.hasText(family)) {
            parts.add(family.trim());
        }
        if (parts.isEmpty()) {
            return null;
        }
        return String.join(" ", parts);
    }
}
