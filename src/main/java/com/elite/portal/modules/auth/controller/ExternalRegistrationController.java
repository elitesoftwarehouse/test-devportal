package com.elite.portal.modules.auth.controller;

import com.elite.portal.modules.auth.dto.ExternalUserRegistrationRequest;
import com.elite.portal.modules.auth.dto.ExternalUserRegistrationResponse;
import com.elite.portal.modules.auth.service.ExternalRegistrationService;
import com.elite.portal.shared.logging.AppLogger;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller per la registrazione di utenti esterni (professionisti e referenti aziendali).
 * Supporta sia la registrazione API JSON che form-based per retrocompatibilità.
 */
@RestController
@RequestMapping("/api/auth")
public class ExternalRegistrationController {

    private final ExternalRegistrationService externalRegistrationService;
    private final AppLogger logger;

    public ExternalRegistrationController(ExternalRegistrationService externalRegistrationService,
                                          AppLogger logger) {
        this.externalRegistrationService = externalRegistrationService;
        this.logger = logger;
    }

    /**
     * Registra un nuovo utente esterno (professionista o referente aziendale).
     * Genera un token di verifica email e lo invia all'utente.
     */
    @PostMapping("/register-external")
    public ResponseEntity<ExternalUserRegistrationResponse> registerExternal(@Valid @RequestBody ExternalUserRegistrationRequest request) {
        logger.info("[ExternalRegistrationController] Avvio registrazione utente esterno, tipo={}, email={}",
                request.getUserType(), request.getEmail());

        ExternalUserRegistrationResponse response = externalRegistrationService.registerExternalUser(request);

        logger.info("[ExternalRegistrationController] Registrazione utente esterno completata, userId={}",
                response.getUserId());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
