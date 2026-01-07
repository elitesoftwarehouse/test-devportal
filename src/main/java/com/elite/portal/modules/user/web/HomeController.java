package com.elite.portal.modules.user.web;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller della Home del portale.
 * Gestisce la rotta radice "/" e popola il modello con il displayName
 * ricavato dall'utente OIDC autenticato, per la visualizzazione in pagina.
 */
@Controller
public class HomeController {

    /**
     * Gestisce la home page del portale.
     *
     * @param model    il modello Thymeleaf
     * @param oidcUser l'utente autenticato tramite OIDC (può essere null se non autenticato)
     * @return il nome della view Thymeleaf da renderizzare
     */
    @GetMapping("/")
    public String index(Model model, @AuthenticationPrincipal OidcUser oidcUser) {
        String displayName = resolveDisplayName(oidcUser);
        model.addAttribute("displayName", displayName);
        return "home/index";
    }

    /**
     * Ricava il nome visualizzabile dell'utente autenticato.
     * Ordine di priorità: fullName -> givenName + familyName -> preferred_username -> name -> stringa vuota.
     *
     * @param user utente OIDC autenticato
     * @return nome da visualizzare; stringa vuota se non disponibile
     */
    public static String resolveDisplayName(OidcUser user) {
        if (user == null) {
            return "";
        }
        String name = null;
        if (user.getFullName() != null && !user.getFullName().isEmpty()) {
            name = user.getFullName();
        } else if ((user.getGivenName() != null && !user.getGivenName().isEmpty()) || (user.getFamilyName() != null && !user.getFamilyName().isEmpty())) {
            String given = user.getGivenName() != null ? user.getGivenName() : "";
            String family = user.getFamilyName() != null ? user.getFamilyName() : "";
            name = (given + " " + family).trim();
        } else if (user.getPreferredUsername() != null && !user.getPreferredUsername().isEmpty()) {
            name = user.getPreferredUsername();
        } else if (user.getName() != null && !user.getName().isEmpty()) {
            name = user.getName();
        }
        return name != null ? name : "";
    }
}
