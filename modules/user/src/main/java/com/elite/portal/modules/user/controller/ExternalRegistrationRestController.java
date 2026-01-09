package com.elite.portal.modules.user.controller;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elite.portal.modules.user.dto.ExternalUserRegistrationRequest;
import com.elite.portal.modules.user.dto.ExternalUserRegistrationResponse;
import com.elite.portal.modules.user.service.ExternalRegistrationService;

@RestController
@RequestMapping("/api/public/register")
public class ExternalRegistrationRestController {

    private final ExternalRegistrationService externalRegistrationService;

    @Autowired
    public ExternalRegistrationRestController(ExternalRegistrationService externalRegistrationService) {
        this.externalRegistrationService = externalRegistrationService;
    }

    @PostMapping("/external")
    public ResponseEntity<ExternalUserRegistrationResponse> registerExternalUser(
        @Valid @RequestBody ExternalUserRegistrationRequest request) {
        externalRegistrationService.registerExternalUser(request);
        ExternalUserRegistrationResponse response = new ExternalUserRegistrationResponse(
            true,
            "Registrazione completata. Controlla la tua email per attivare l'account."
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @ExceptionHandler({IllegalArgumentException.class})
    public ResponseEntity<ExternalUserRegistrationResponse> handleValidationError(IllegalArgumentException ex) {
        ExternalUserRegistrationResponse response = new ExternalUserRegistrationResponse(false, ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler({IllegalStateException.class})
    public ResponseEntity<ExternalUserRegistrationResponse> handleStateError(IllegalStateException ex) {
        ExternalUserRegistrationResponse response = new ExternalUserRegistrationResponse(false, ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
}
