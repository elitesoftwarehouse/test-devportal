package com.elite.portal.modules.auth.controller;

import com.elite.portal.modules.auth.dto.ForgotPasswordRequestDto;
import com.elite.portal.modules.auth.service.ExternalPasswordResetService;
import com.elite.portal.shared.logging.AppLogger;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth/password")
@Validated
public class ExternalPasswordResetController {

    private final ExternalPasswordResetService externalPasswordResetService;
    private final AppLogger logger;

    public ExternalPasswordResetController(ExternalPasswordResetService externalPasswordResetService,
                                           AppLogger logger) {
        this.externalPasswordResetService = externalPasswordResetService;
        this.logger = logger;
    }

    @PostMapping("/forgot")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto requestDto) {
        logger.info("Richiesta reset password ricevuta", "email", requestDto.getEmail());
        externalPasswordResetService.handleForgotPassword(requestDto.getEmail());
        // Risposta generica per evitare user enumeration
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
