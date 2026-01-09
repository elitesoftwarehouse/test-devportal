package com.elite.portal.modules.user.controller;

import com.elite.portal.modules.user.dto.ProfessionalProfileDto;
import com.elite.portal.modules.user.service.ProfessionalProfileService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/professional/profile")
public class ProfessionalProfilePageController {

    private final ProfessionalProfileService professionalProfileService;

    public ProfessionalProfilePageController(ProfessionalProfileService professionalProfileService) {
        this.professionalProfileService = professionalProfileService;
    }

    @GetMapping
    public String viewProfile(Model model, Authentication authentication) {
        Long userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof com.elite.portal.core.entity.User) {
            com.elite.portal.core.entity.User user = (com.elite.portal.core.entity.User) authentication.getPrincipal();
            userId = user.getId();
        }
        if (userId == null) {
            model.addAttribute("profile", new ProfessionalProfileDto());
            return "user/professional-profile";
        }
        try {
            ProfessionalProfileDto dto = professionalProfileService.getByUserId(userId);
            model.addAttribute("profile", dto);
        } catch (Exception e) {
            model.addAttribute("profile", new ProfessionalProfileDto());
        }
        return "user/professional-profile";
    }
}
