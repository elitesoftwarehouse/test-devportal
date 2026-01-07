package com.elite.portal.modules.home.controller;

import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller MVC per la Home page.
 * Gestisce la rotta di base e popola il model con l'attributo "displayName"
 * risolto dall'utente autenticato (OIDC o OAuth2), con fallback null-safe.
 */
@Controller
@RequestMapping("/")
public class HomeController {

    /**
     * Gestisce GET "/" e imposta nel model l'attributo "displayName"
     * calcolato in base al principal autenticato.
     *
     * @param model     il Model MVC
     * @param principal principal autenticato risolto tramite Spring Security
     * @return nome della view Thymeleaf "home/index"
     */
    @GetMapping
    public String index(Model model, @AuthenticationPrincipal(expression = "principal") Object principal) {
        String displayName = resolveDisplayName(principal);
        model.addAttribute("displayName", displayName);
        return "home/index";
    }

    private String resolveDisplayName(Object principal) {
        if (principal instanceof OidcUser) {
            OidcUser oidcUser = (OidcUser) principal;

            String fullName = safeTrim(oidcUser.getFullName());
            if (isNotBlank(fullName)) {
                return fullName;
            }

            Map<String, Object> claims = oidcUser.getClaims();
            String claimName = stringify(claims != null ? claims.get("name") : null);
            if (isNotBlank(claimName)) {
                return claimName;
            }

            String email = safeTrim(oidcUser.getEmail());
            if (isNotBlank(email)) {
                return email;
            }

            String preferredUsername = safeTrim(oidcUser.getPreferredUsername());
            if (isNotBlank(preferredUsername)) {
                return preferredUsername;
            }
        } else if (principal instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) principal;
            Map<String, Object> attributes = oauth2User.getAttributes();

            String name = stringify(attributes != null ? attributes.get("name") : null);
            if (isNotBlank(name)) {
                return name;
            }

            String preferredUsername = stringify(attributes != null ? attributes.get("preferred_username") : null);
            if (isNotBlank(preferredUsername)) {
                return preferredUsername;
            }

            String email = stringify(attributes != null ? attributes.get("email") : null);
            if (isNotBlank(email)) {
                return email;
            }

            String fallback = safeTrim(oauth2User.getName());
            if (isNotBlank(fallback)) {
                return fallback;
            }
        }
        // Fallback generico se non autenticato o dati non disponibili
        return "Utente";
    }

    private String stringify(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }

    private String safeTrim(String value) {
        return value == null ? null : value.trim();
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
