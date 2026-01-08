package com.elite.portal.modules.user.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Controller per la pagina di login basata su Thymeleaf.
 */
@Controller
public class LoginPageController {

    @GetMapping("/login")
    public String login(@RequestParam(name = "error", required = false) String error,
            @RequestParam(name = "logout", required = false) String logout,
            Model model) {
        if (error != null) {
            String messageKey;
            switch (error) {
            case "disabled":
                messageKey = "Account non attivo. Contattare il supporto.";
                break;
            case "blocked":
                messageKey = "Account bloccato. Contattare il supporto.";
                break;
            case "notfound":
                messageKey = "Utente non trovato.";
                break;
            case "badcredentials":
            default:
                messageKey = "Credenziali non valide.";
                break;
            }
            model.addAttribute("errorMessage", messageKey);
        }
        if (logout != null) {
            model.addAttribute("logoutMessage", "Logout effettuato con successo.");
        }
        return "user/login";
    }
}
