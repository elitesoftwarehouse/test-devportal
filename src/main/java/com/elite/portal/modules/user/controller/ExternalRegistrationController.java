package com.elite.portal.modules.user.controller;

import java.util.Locale;

import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.elite.portal.modules.user.dto.ExternalRegistrationForm;
import com.elite.portal.modules.user.service.ExternalRegistrationService;
import com.elite.portal.modules.user.service.TokenValidationResult;

/**
 * Controller MVC per la gestione del flusso di completamento
 * registrazione dei collaboratori esterni approvati.
 * <p>
 * Gestisce:
 * <ul>
 *   <li>Pagina di atterraggio dal link con token</li>
 *   <li>Validazione preliminare del token</li>
 *   <li>Form impostazione password</li>
 *   <li>Messaggi di successo/errore e redirect alla login</li>
 * </ul>
 */
@Controller
@RequestMapping("/external/registration")
public class ExternalRegistrationController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExternalRegistrationController.class);

    private final ExternalRegistrationService externalRegistrationService;
    private final MessageSource messageSource;

    @Autowired
    public ExternalRegistrationController(ExternalRegistrationService externalRegistrationService,
                                          MessageSource messageSource) {
        this.externalRegistrationService = externalRegistrationService;
        this.messageSource = messageSource;
    }

    /**
     * Pagina di atterraggio dal link di registrazione.
     * Valida preliminarmente il token e, se valido, mostra il form di
     * impostazione password. In caso di token non valido o scaduto viene
     * mostrata una pagina di errore dedicata.
     *
     * @param token  token di registrazione
     * @param model  modello MVC
     * @param locale locale corrente per messaggi localizzati
     * @return nome della view Thymeleaf da renderizzare
     */
    @GetMapping
    public String showRegistrationPage(@RequestParam("token") String token,
                                       Model model,
                                       Locale locale) {
        LOGGER.info("Accesso alla pagina di completamento registrazione con token={}", token);

        TokenValidationResult validationResult = externalRegistrationService.validateRegistrationToken(token);
        if (!validationResult.isValid()) {
            LOGGER.warn("Token di registrazione non valido o scaduto: {}", token);
            model.addAttribute("tokenInvalid", true);
            model.addAttribute("errorCode", validationResult.getErrorCode());
            model.addAttribute("errorMessageKey", validationResult.getMessageKey());
            model.addAttribute("loginUrl", "/login");
            return "user/external-registration-error";
        }

        ExternalRegistrationForm form = new ExternalRegistrationForm();
        form.setToken(token);

        model.addAttribute("registrationForm", form);
        model.addAttribute("email", validationResult.getEmail());
        model.addAttribute("tokenValid", true);
        model.addAttribute("passwordPattern", externalRegistrationService.getPasswordPattern());
        model.addAttribute("passwordMinLength", externalRegistrationService.getPasswordMinLength());
        model.addAttribute("passwordMaxLength", externalRegistrationService.getPasswordMaxLength());

        return "user/external-registration";
    }

    /**
     * Gestione submit del form di impostazione password.
     * Esegue le validazioni server-side e, in caso di esito positivo,
     * completa la registrazione dell'utente esterno.
     *
     * @param form   form di registrazione contenente token e password
     * @param bindingResult binding dei risultati di validazione
     * @param model  modello MVC
     * @param locale locale corrente per messaggi localizzati
     * @return view Thymeleaf o redirect alla pagina di login in caso di successo
     */
    @PostMapping
    public String completeRegistration(@Valid @ModelAttribute("registrationForm") ExternalRegistrationForm form,
                                       BindingResult bindingResult,
                                       Model model,
                                       Locale locale) {
        LOGGER.info("Tentativo di completamento registrazione per token={}", form.getToken());

        if (!form.getPassword().equals(form.getConfirmPassword())) {
            String message = messageSource.getMessage("external.registration.error.password.mismatch",
                    null, locale);
            bindingResult.rejectValue("confirmPassword", "password.mismatch", message);
        }

        if (bindingResult.hasErrors()) {
            TokenValidationResult validationResult = externalRegistrationService
                    .validateRegistrationToken(form.getToken());
            if (!validationResult.isValid()) {
                model.addAttribute("tokenInvalid", true);
                model.addAttribute("errorCode", validationResult.getErrorCode());
                model.addAttribute("errorMessageKey", validationResult.getMessageKey());
                model.addAttribute("loginUrl", "/login");
                return "user/external-registration-error";
            }

            model.addAttribute("email", validationResult.getEmail());
            model.addAttribute("tokenValid", true);
            model.addAttribute("passwordPattern", externalRegistrationService.getPasswordPattern());
            model.addAttribute("passwordMinLength", externalRegistrationService.getPasswordMinLength());
            model.addAttribute("passwordMaxLength", externalRegistrationService.getPasswordMaxLength());
            return "user/external-registration";
        }

        try {
            externalRegistrationService.completeRegistration(form.getToken(), form.getPassword());
        } catch (IllegalStateException ex) {
            LOGGER.warn("Errore di stato durante il completamento registrazione: {}", ex.getMessage());
            model.addAttribute("tokenInvalid", true);
            model.addAttribute("errorCode", "USER_ALREADY_REGISTERED");
            model.addAttribute("errorMessageKey", "external.registration.error.user.alreadyRegistered");
            model.addAttribute("loginUrl", "/login");
            return "user/external-registration-error";
        } catch (IllegalArgumentException ex) {
            LOGGER.warn("Token non valido durante il completamento registrazione: {}", ex.getMessage());
            model.addAttribute("tokenInvalid", true);
            model.addAttribute("errorCode", "TOKEN_INVALID");
            model.addAttribute("errorMessageKey", "external.registration.error.token.invalid");
            model.addAttribute("loginUrl", "/login");
            return "user/external-registration-error";
        }

        String successMessage = messageSource.getMessage("external.registration.success", null, locale);
        model.addAttribute("successMessage", successMessage);
        model.addAttribute("loginUrl", "/login");

        return "user/external-registration-success";
    }
}
