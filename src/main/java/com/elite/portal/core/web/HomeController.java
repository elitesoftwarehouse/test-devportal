package com.elite.portal.core.web;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller principale per la home page del portale Elite.
 * Espone la route "/" e popola l'attributo di modello "displayName" in base
 * alle informazioni dell'utente autenticato (OIDC/OAuth2/Spring Security standard).
 */
@Controller
public class HomeController {

    /**
     * Gestisce la route di home page.
     *
     * @param authentication il contesto di autenticazione corrente (può essere null se non autenticato)
     * @param model il modello per la view
     * @return il nome della view Thymeleaf (home/index)
     */
    @GetMapping("/")
    public String index(final Authentication authentication, final Model model) {
        String displayName = resolveDisplayName(authentication);
        model.addAttribute("displayName", displayName);
        return "home/index";
    }

    /**
     * Risolve un nome visualizzabile a partire dal principal autenticato.
     * Ordine di preferenza attributi OIDC/OAuth2: name, preferred_username, given_name + family_name.
     * In fallback usa authentication.getName(). Se non disponibile, stringa vuota.
     *
     * @param authentication autenticazione corrente
     * @return nome da visualizzare o stringa vuota se non determinabile
     */
    private String resolveDisplayName(final Authentication authentication) {
        if (authentication == null) {
            return "";
        }

        // OIDC user
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
            Object principal = token.getPrincipal();

            if (principal instanceof OidcUser) {
                OidcUser oidcUser = (OidcUser) principal;
                String name = firstNonEmpty(
                        oidcUser.getFullName(),
                        oidcUser.getGivenName(),
                        oidcUser.getFamilyName()
                );
                if (StringUtils.hasText(name)) {
                    return name;
                }
                // Fallback su claim comuni
                String fromClaims = firstNonEmpty(
                        oidcUser.getClaimAsString("name"),
                        oidcUser.getClaimAsString("preferred_username"),
                        joinNonEmpty(oidcUser.getClaimAsString("given_name"), oidcUser.getClaimAsString("family_name"))
                );
                if (StringUtils.hasText(fromClaims)) {
                    return fromClaims;
                }
            }

            if (principal instanceof OAuth2User) {
                OAuth2User oAuth2User = (OAuth2User) principal;
                Map<String, Object> attrs = oAuth2User.getAttributes();
                String name = firstNonEmpty(
                        getAttrAsString(attrs, "name"),
                        getAttrAsString(attrs, "preferred_username"),
                        joinNonEmpty(getAttrAsString(attrs, "given_name"), getAttrAsString(attrs, "family_name"))
                );
                if (StringUtils.hasText(name)) {
                    return name;
                }
            }
        }

        // Fallback generico
        String fallback = authentication.getName();
        return StringUtils.hasText(fallback) ? fallback : "";
    }

    private String getAttrAsString(final Map<String, Object> attrs, final String key) {
        if (attrs == null) {
            return null;
        }
        Object v = attrs.get(key);
        return v != null ? String.valueOf(v) : null;
    }

    private String firstNonEmpty(String... values) {
        if (values == null) {
            return null;
        }
        for (String v : values) {
            if (StringUtils.hasText(v)) {
                return v;
            }
        }
        return null;
    }

    private String joinNonEmpty(String left, String right) {
        List<String> parts = Arrays.asList(left, right);
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (StringUtils.hasText(p)) {
                if (sb.length() > 0) {
                    sb.append(' ');
                }
                sb.append(p);
            }
        }
        return sb.toString();
    }
}
