package com.elite.portal.modules.user.auth.api;

import com.elite.portal.modules.user.auth.dto.ExternalCompleteRegistrationRequest;
import com.elite.portal.modules.user.auth.dto.ExternalCompleteRegistrationResponse;
import com.elite.portal.modules.user.auth.dto.ExternalRegistrationErrorCode;
import com.elite.portal.modules.user.auth.service.ExternalRegistrationService;
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

/**
 * REST controller per la gestione del completamento registrazione
 * dei collaboratori esterni tramite token di registrazione.
 */
@RestController
@RequestMapping("/api/auth/external")
@Validated
public class ExternalRegistrationController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ExternalRegistrationController.class);

    private final ExternalRegistrationService externalRegistrationService;

    public ExternalRegistrationController(ExternalRegistrationService externalRegistrationService) {
        this.externalRegistrationService = externalRegistrationService;
    }

    /**
     * Endpoint per completare la registrazione di un collaboratore esterno già approvato,
     * tramite token di registrazione e definizione della password.
     *
     * @param request richiesta contenente token e nuova password
     * @return risposta standardizzata con esito e/o codice di errore
     */
    @PostMapping("/complete-registration")
    public ResponseEntity<ExternalCompleteRegistrationResponse> completeRegistration(
            @Valid @RequestBody ExternalCompleteRegistrationRequest request) {

        ExternalCompleteRegistrationResponse response = externalRegistrationService.completeRegistration(request);

        if (response.isSuccess()) {
            LOGGER.info("Completamento registrazione esterna avvenuto con successo per token={}", request.getToken());
            return ResponseEntity.ok(response);
        }

        ExternalRegistrationErrorCode errorCode = response.getErrorCode();
        if (errorCode == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        // Mappatura codici errore su HTTP status. Si mantiene risposta standardizzata lato body.
        HttpStatus status;
        switch (errorCode) {
            case TOKEN_INVALIDO:
            case TOKEN_GIA_UTILIZZATO:
            case UTENTE_NON_TROVATO:
                status = HttpStatus.BAD_REQUEST;
                break;
            case TOKEN_SCADUTO:
                status = HttpStatus.GONE;
                break;
            case PASSWORD_NON_VALIDA:
                status = HttpStatus.UNPROCESSABLE_ENTITY;
                break;
            default:
                status = HttpStatus.BAD_REQUEST;
        }

        LOGGER.warn("Errore completamento registrazione esterna: token={}, codiceErrore={}",
                request.getToken(), errorCode);

        return ResponseEntity.status(status).body(response);
    }
}
