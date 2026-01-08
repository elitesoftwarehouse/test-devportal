package com.elite.portal.modules.auth.controller;

import com.elite.portal.modules.auth.dto.EmailVerificationResponseDto;
import com.elite.portal.modules.auth.service.EmailVerificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    public EmailVerificationController(EmailVerificationService emailVerificationService) {
        this.emailVerificationService = emailVerificationService;
    }

    @GetMapping("/verify-email")
    public ResponseEntity<EmailVerificationResponseDto> verifyEmail(@RequestParam("token") String token) {
        EmailVerificationResponseDto response = emailVerificationService.verifyEmail(token);
        HttpStatus status = response.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return new ResponseEntity<>(response, status);
    }
}
