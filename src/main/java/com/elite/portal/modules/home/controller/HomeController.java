package com.elite.portal.modules.home.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller MVC per la Home del portale.
 * Gestisce la rotta root '/' e popola il model con l'attributo "displayName"
 * risolto dal principal autenticato tramite OIDC/OAuth2.
 */
@Controller
@RequestMapping("/")
public class HomeController {

    /**
     * Gestisce la GET sulla root e inserisce nel model il nome visualizzato dell'utente autenticato.
     *
     * Ordine di risoluzione del displayName:
     * - OidcUser: fullName -> claims["name"] -> email -> preferredUsername
     * - OAuth2User: attributes["name"] -> attributes["preferred_username"] -> attributes["email"] -> getName()
     * In caso di mancata risoluzione, viene impostata una stringa vuota.
     *
     * @param model     il model della view
     * @param principal il principal autenticato (estratto dal contesto security)
     * @return la view "home/index"
     */
    @GetMapping
    public String index(Model model, @AuthenticationPrincipal(expression = "principal") Object principal) {
        String displayName = resolveDisplayName(principal);
        model.addAttribute("displayName", displayName);
        return "home/index";
    }

    private String resolveDisplayName(Object principal) {
        if (principal instanceof OidcUser) {
            OidcUser user = (OidcUser) principal;
            String name = trimToNull(user.getFullName());
            if (name != null) {
                return name;
            }
            Object claimName = user.getClaims() != null ? user.getClaims().get("name") : null;
            name = toStringOrNull(claimName);
            if (name != null) {
                return name;
            }
            name = trimToNull(user.getEmail());
            if (name != null) {
                return name;
            }
            name = trimToNull(user.getPreferredUsername());
            if (name != null) {
                return name;
            }
            return "";
        } else if (principal instanceof OAuth2User) {
            OAuth2User user = (OAuth2User) principal;
            if (user.getAttributes() != null) {
                String name = toStringOrNull(user.getAttributes().get("name"));
                if (name != null && !name.isEmpty()) {
                    return name;
                }
                name = toStringOrNull(user.getAttributes().get("preferred_username"));
                if (name != null && !name.isEmpty()) {
                    return name;
                }
                name = toStringOrNull(user.getAttributes().get("email"));
                if (name != null && !name.isEmpty()) {
                    return name;
                }
            }
            String name = trimToNull(user.getName());
            if (name != null) {
                return name;
            }
            return "";
        }
        return "";
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String v = value.trim();
        return v.isEmpty() ? null : v;
    }

    private String toStringOrNull(Object value) {
        if (value == null) {
            return null;
        }
        String str = String.valueOf(value);
        return trimToNull(str);
    }
}
