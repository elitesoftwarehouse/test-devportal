package com.elite.portal.modules.accreditamento.api;

import com.elite.portal.modules.accreditamento.api.dto.AccreditamentoRichiestaCreateRequest;
import com.elite.portal.modules.accreditamento.api.dto.AccreditamentoRichiestaResponse;
import com.elite.portal.modules.accreditamento.service.AccreditamentoRichiestaService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accreditamenti")
public class AccreditamentoRichiestaController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AccreditamentoRichiestaController.class);

    private final AccreditamentoRichiestaService service;

    public AccreditamentoRichiestaController(AccreditamentoRichiestaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<AccreditamentoRichiestaResponse> creaRichiesta(@Valid @RequestBody AccreditamentoRichiestaCreateRequest request,
                                                                         BindingResult bindingResult)
            throws MethodArgumentNotValidException {
        if (bindingResult.hasErrors()) {
            throw new MethodArgumentNotValidException(null, bindingResult);
        }

        AccreditamentoRichiestaResponse response = service.creaRichiesta(request);
        URI location = URI.create("/api/accreditamenti/" + response.getId());
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccreditamentoRichiestaResponse> getRichiesta(@PathVariable("id") Long id) {
        Optional<AccreditamentoRichiestaResponse> responseOpt = service.getRichiestaByIdForCurrentUser(id);
        if (responseOpt.isEmpty()) {
            LOGGER.warn("Richiesta di accreditamento id={} non trovata o non accessibile dall'utente corrente", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(responseOpt.get());
    }

    @GetMapping("/mie")
    public ResponseEntity<List<AccreditamentoRichiestaResponse>> getMieRichieste() {
        List<AccreditamentoRichiestaResponse> responses = service.getRichiesteCorrentiUtente();
        return ResponseEntity.ok(responses);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidationException(MethodArgumentNotValidException ex) {
        LOGGER.debug("Errore di validazione nella richiesta di accreditamento", ex);
        return ResponseEntity.badRequest().body("Payload non valido per richiesta di accreditamento");
    }
}
