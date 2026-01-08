package com.elite.portal.modules.user.web;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.elite.portal.modules.user.security.ExternalUserDetails;

/**
 * Controller per la dashboard dedicata ai collaboratori esterni.
 */
@Controller
@RequestMapping("/external")
public class ExternalDashboardController {

    /**
     * Mostra la dashboard introduttiva per il primo login degli utenti esterni.
     *
     * @param authentication autenticazione corrente
     * @param model modello per la vista
     * @return nome del template Thymeleaf
     */
    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication, Model model) {
        if (authentication != null && authentication.getPrincipal() instanceof ExternalUserDetails) {
            ExternalUserDetails details = (ExternalUserDetails) authentication.getPrincipal();
            model.addAttribute("username", details.getUsername());
            model.addAttribute("roles", authentication.getAuthorities());
        }
        return "user/external-dashboard";
    }
}
