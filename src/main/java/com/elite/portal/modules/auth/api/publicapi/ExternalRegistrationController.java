package com.elite.portal.modules.auth.api.publicapi;

import com.elite.portal.modules.auth.application.ExternalRegistrationService;
import com.elite.portal.modules.auth.application.dto.ExternalRegistrationRequestDto;
import com.elite.portal.modules.auth.application.dto.ExternalRegistrationResponseDto;
import com.elite.portal.shared.api.ErrorResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/external-registration")
public class ExternalRegistrationController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExternalRegistrationController.class);

    private final ExternalRegistrationService externalRegistrationService;

    public ExternalRegistrationController(ExternalRegistrationService externalRegistrationService) {
        this.externalRegistrationService = externalRegistrationService;
    }

    @PostMapping
    public ResponseEntity<ExternalRegistrationResponseDto> registerExternalUser(
            @Valid @RequestBody ExternalRegistrationRequestDto requestDto,
            BindingResult bindingResult,
            Locale locale) {

        if (bindingResult.hasErrors()) {
            String message = bindingResult.getFieldErrors()
                    .stream()
                    .map(this::formatFieldError)
                    .collect(Collectors.joining(", "));
            throw new InvalidExternalRegistrationRequestException(message);
        }

        ExternalRegistrationResponseDto response = externalRegistrationService.registerExternalUser(requestDto, locale);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private String formatFieldError(FieldError error) {
        return error.getField() + ": " + error.getDefaultMessage();
    }

    @ExceptionHandler(InvalidExternalRegistrationRequestException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRequest(InvalidExternalRegistrationRequestException ex, Locale locale) {
        LOGGER.debug("Invalid external registration request: {}", ex.getMessage());
        ErrorResponse errorResponse = ErrorResponse.of(
                "external.registration.validation_error",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST.value(),
                locale
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }
}
