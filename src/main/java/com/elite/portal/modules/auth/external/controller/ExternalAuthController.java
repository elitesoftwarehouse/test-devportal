package com.elite.portal.modules.auth.external.controller;

import com.elite.portal.modules.auth.external.dto.ExternalLoginRequestDto;
import com.elite.portal.modules.auth.external.dto.ExternalLoginResponseDto;
import com.elite.portal.modules.auth.external.service.ExternalAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/external")
@Validated
public class ExternalAuthController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExternalAuthController.class);

    private final ExternalAuthService externalAuthService;

    public ExternalAuthController(ExternalAuthService externalAuthService) {
        this.externalAuthService = externalAuthService;
    }

    @PostMapping("/login")
    public ResponseEntity<ExternalLoginResponseDto> login(@Valid @RequestBody ExternalLoginRequestDto requestDto,
                                                          HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();
        LOGGER.debug("Richiesta login esterno ricevuta da IP={}", clientIp);

        ExternalLoginResponseDto responseDto = externalAuthService.login(requestDto, clientIp);

        return new ResponseEntity<>(responseDto, HttpStatus.OK);
    }
}
