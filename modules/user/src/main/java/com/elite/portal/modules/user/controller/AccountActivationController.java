package com.elite.portal.modules.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.elite.portal.modules.user.service.ExternalRegistrationService;

@Controller
@RequestMapping("/user")
public class AccountActivationController {

    private final ExternalRegistrationService externalRegistrationService;

    @Autowired
    public AccountActivationController(ExternalRegistrationService externalRegistrationService) {
        this.externalRegistrationService = externalRegistrationService;
    }

    @GetMapping("/activate")
    public String activate(@RequestParam("token") String token, Model model) {
        try {
            externalRegistrationService.activateUser(token);
            model.addAttribute("success", true);
            model.addAttribute("message", "Account attivato correttamente. Ora puoi effettuare il login.");
        } catch (IllegalArgumentException e) {
            model.addAttribute("success", false);
            model.addAttribute("message", e.getMessage());
        } catch (IllegalStateException e) {
            model.addAttribute("success", false);
            model.addAttribute("message", e.getMessage());
        }
        return "user/account-activation-result";
    }
}
