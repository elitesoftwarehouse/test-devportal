package com.elite.portal.modules.accreditamento.api;

import javax.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elite.portal.modules.accreditamento.model.AccreditamentoRequest;
import com.elite.portal.modules.accreditamento.service.AccreditamentoService;

@RestController
@RequestMapping("/accreditamenti")
public class AccreditamentoController {

    private final AccreditamentoService accreditamentoService;

    public AccreditamentoController(AccreditamentoService accreditamentoService) {
        this.accreditamentoService = accreditamentoService;
    }

    @PostMapping
    public ResponseEntity<AccreditamentoResponse> create(@Valid @RequestBody AccreditamentoCreateRequest request,
                                                         Authentication authentication) {
        Long userId = extractUserId(authentication);
        AccreditamentoRequest model = new AccreditamentoRequest();
        model.setEmail(request.getEmail());
        model.setFirstName(request.getFirstName());
        model.setLastName(request.getLastName());
        model.setUserId(userId);

        AccreditamentoRequest created = accreditamentoService.createAccreditamento(model);

        AccreditamentoResponse response = new AccreditamentoResponse(
                created.getId(),
                created.getEmail(),
                created.getFirstName(),
                created.getLastName(),
                created.getStatus(),
                created.getCreatedAt(),
                created.getUpdatedAt()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccreditamentoResponse> getById(@PathVariable("id") Long id,
                                                           Authentication authentication) {
        Long userId = extractUserId(authentication);
        AccreditamentoRequest request = accreditamentoService.getByIdAndUser(id, userId);
        if (request == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        if (!userId.equals(request.getUserId())) {
            throw new AccessDeniedException("Accesso non consentito alla richiesta di un altro utente");
        }
        AccreditamentoResponse response = new AccreditamentoResponse(
                request.getId(),
                request.getEmail(),
                request.getFirstName(),
                request.getLastName(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
        return ResponseEntity.ok(response);
    }

    private Long extractUserId(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new AccessDeniedException("Utente non autenticato");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof Long) {
            return (Long) principal;
        }
        if (principal instanceof String) {
            return Long.parseLong((String) principal);
        }
        throw new AccessDeniedException("Formato principal non supportato");
    }
}
