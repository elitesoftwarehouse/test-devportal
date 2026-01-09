package com.elite.portal.modules.auth.config;

import com.elite.portal.modules.auth.dto.EmailVerificationResponseDto;
import com.elite.portal.modules.auth.exception.EmailVerificationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.elite.portal.modules.auth")
public class EmailVerificationExceptionHandler {

    @ExceptionHandler(EmailVerificationException.class)
    public ResponseEntity<EmailVerificationResponseDto> handleEmailVerificationException(EmailVerificationException ex) {
        EmailVerificationResponseDto body = new EmailVerificationResponseDto(false, ex.getCode(), ex.getMessage(), false);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}
