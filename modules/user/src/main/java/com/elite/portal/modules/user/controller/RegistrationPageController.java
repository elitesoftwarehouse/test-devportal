package com.elite.portal.modules.user.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.elite.portal.core.entity.RoleType;

@Controller
@RequestMapping("/public")
public class RegistrationPageController {

    @GetMapping("/register")
    public String showRegistrationPage(Model model) {
        model.addAttribute("roles", new RoleType[] { RoleType.EXTERNAL_OWNER, RoleType.EXTERNAL_COLLABORATOR });
        return "user/external-registration";
    }
}
