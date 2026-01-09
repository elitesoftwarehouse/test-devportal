package com.elite.portal.modules.auth.api;

import com.elite.portal.modules.auth.dto.PasswordResetConfirmRequestDto;
import com.elite.portal.modules.auth.dto.PasswordResetConfirmResponseDto;
import com.elite.portal.modules.auth.service.PasswordResetConfirmService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
public class PasswordResetConfirmController {

    private static final Logger LOGGER = LoggerFactory.getLogger(PasswordResetConfirmController.class);

    private final PasswordResetConfirmService passwordResetConfirmService;

    public PasswordResetConfirmController(PasswordResetConfirmService passwordResetConfirmService) {
        this.passwordResetConfirmService = passwordResetConfirmService;
    }

    @PostMapping("/reset")
    public ResponseEntity<PasswordResetConfirmResponseDto> resetPassword(@Valid @RequestBody PasswordResetConfirmRequestDto request) {
        LOGGER.info("Richiesta reset password ricevuta");
        PasswordResetConfirmResponseDto responseDto = passwordResetConfirmService.resetPassword(request);
        HttpStatus status = responseDto.isSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
        return new ResponseEntity<>(responseDto, status);
    }
}
