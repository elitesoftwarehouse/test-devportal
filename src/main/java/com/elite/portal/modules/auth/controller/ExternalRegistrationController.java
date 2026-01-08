package com.elite.portal.modules.auth.controller;

import com.elite.portal.modules.auth.dto.ExternalRegistrationRequest;
import com.elite.portal.modules.auth.dto.ExternalRegistrationResponse;
import com.elite.portal.modules.auth.service.ExternalRegistrationService;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.validation.Valid;

@Controller
@RequestMapping("/public/external-registration")
@Validated
public class ExternalRegistrationController {

    private final ExternalRegistrationService externalRegistrationService;

    public ExternalRegistrationController(ExternalRegistrationService externalRegistrationService) {
        this.externalRegistrationService = externalRegistrationService;
    }

    @GetMapping
    public String showRegistrationForm(Model model) {
        if (!model.containsAttribute("registrationRequest")) {
            model.addAttribute("registrationRequest", new ExternalRegistrationRequest());
        }
        return "auth/external-registration";
    }

    @PostMapping(consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public ExternalRegistrationResponse registerExternal(@Valid @ModelAttribute("registrationRequest") ExternalRegistrationRequest request,
                                                         BindingResult bindingResult) {
        ExternalRegistrationResponse response = new ExternalRegistrationResponse();
        if (bindingResult.hasErrors()) {
            response.setSuccess(false);
            response.setMessage("Dati non validi. Verificare i campi evidenziati.");
            response.setFieldErrors(bindingResult.getFieldErrors());
            return response;
        }

        return externalRegistrationService.registerExternal(request);
    }
}
