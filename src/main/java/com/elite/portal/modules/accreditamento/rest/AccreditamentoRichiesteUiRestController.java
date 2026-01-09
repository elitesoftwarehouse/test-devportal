package com.elite.portal.modules.accreditamento.rest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;

import com.elite.portal.modules.accreditamento.client.AccreditamentoRichiesteClient;
import com.elite.portal.modules.accreditamento.dto.AccreditamentoRichiestaDettaglioDto;
import com.elite.portal.modules.accreditamento.dto.AccreditamentoRichiestaFilterDto;
import com.elite.portal.modules.accreditamento.dto.AccreditamentoRichiestaListItemDto;

/**
 * Controller REST usato dalla UI (AJAX) per gestire la coda richieste di accreditamento.
 * Si appoggia al client che chiama le API backend e gestisce errori e messaggi utente.
 */
@RestController
@RequestMapping("/ui/api/accreditamento/richieste")
@PreAuthorize("hasAnyRole('SYS_ADMIN','IT_OPERATOR')")
public class AccreditamentoRichiesteUiRestController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AccreditamentoRichiesteUiRestController.class);

    private final AccreditamentoRichiesteClient richiesteClient;

    @Autowired
    public AccreditamentoRichiesteUiRestController(AccreditamentoRichiesteClient richiesteClient) {
        this.richiesteClient = richiesteClient;
    }

    @GetMapping
    public ResponseEntity<?> search(
        @RequestParam(name = "stato", required = false) String stato,
        @RequestParam(name = "q", required = false) String query) {

        AccreditamentoRichiestaFilterDto filter = new AccreditamentoRichiestaFilterDto();
        filter.setStato(stato);
        filter.setQuery(query);

        try {
            List<AccreditamentoRichiestaListItemDto> result = richiesteClient.search(filter);
            return ResponseEntity.ok(result);
        } catch (HttpClientErrorException.Forbidden ex) {
            LOGGER.warn("Accesso non autorizzato alla coda richieste", ex);
            return buildError(HttpStatus.FORBIDDEN, "Non sei autorizzato a visualizzare le richieste di accreditamento.");
        } catch (HttpClientErrorException ex) {
            LOGGER.warn("Errore client durante la ricerca richieste", ex);
            return buildError(ex.getStatusCode(), "Errore nella ricerca delle richieste di accreditamento.");
        } catch (HttpServerErrorException ex) {
            LOGGER.error("Errore server backend durante la ricerca richieste", ex);
            return buildError(HttpStatus.BAD_GATEWAY, "Si è verificato un errore nel server backend. Riprova più tardi.");
        } catch (RestClientException ex) {
            LOGGER.error("Errore generico durante la ricerca richieste", ex);
            return buildError(HttpStatus.BAD_GATEWAY, "Impossibile recuperare le richieste al momento. Riprova più tardi.");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> dettaglio(@PathVariable("id") Long id) {
        try {
            AccreditamentoRichiestaDettaglioDto dettaglio = richiesteClient.getDettaglio(id);
            if (dettaglio == null) {
                return buildError(HttpStatus.NOT_FOUND, "Richiesta non trovata.");
            }
            return ResponseEntity.ok(dettaglio);
        } catch (HttpClientErrorException.Forbidden ex) {
            LOGGER.warn("Accesso non autorizzato al dettaglio richiesta {}", id, ex);
            return buildError(HttpStatus.FORBIDDEN, "Non sei autorizzato a visualizzare questa richiesta.");
        } catch (HttpClientErrorException.NotFound ex) {
            LOGGER.warn("Richiesta {} non trovata", id, ex);
            return buildError(HttpStatus.NOT_FOUND, "Richiesta non trovata.");
        } catch (HttpClientErrorException ex) {
            LOGGER.warn("Errore client durante il recupero dettaglio richiesta {}", id, ex);
            return buildError(ex.getStatusCode(), "Errore nel recupero del dettaglio richiesta.");
        } catch (HttpServerErrorException ex) {
            LOGGER.error("Errore server backend durante il recupero dettaglio richiesta {}", id, ex);
            return buildError(HttpStatus.BAD_GATEWAY, "Si è verificato un errore nel server backend. Riprova più tardi.");
        } catch (RestClientException ex) {
            LOGGER.error("Errore generico durante il recupero dettaglio richiesta {}", id, ex);
            return buildError(HttpStatus.BAD_GATEWAY, "Impossibile recuperare i dettagli al momento. Riprova più tardi.");
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approva(@PathVariable("id") Long id) {
        try {
            richiesteClient.approva(id);
            Map<String, Object> body = new HashMap<>();
            body.put("success", true);
            body.put("message", "Richiesta approvata con successo.");
            return ResponseEntity.ok(body);
        } catch (HttpClientErrorException.Forbidden ex) {
            LOGGER.warn("Accesso non autorizzato per approvare richiesta {}", id, ex);
            return buildError(HttpStatus.FORBIDDEN, "Non sei autorizzato ad approvare questa richiesta.");
        } catch (HttpClientErrorException.BadRequest ex) {
            LOGGER.warn("Richiesta non più in stato PENDING o non valida per approvazione {}", id, ex);
            return buildError(HttpStatus.BAD_REQUEST, "La richiesta non può essere approvata (forse non è più in stato PENDING).");
        } catch (HttpClientErrorException ex) {
            LOGGER.warn("Errore client durante l'approvazione della richiesta {}", id, ex);
            return buildError(ex.getStatusCode(), "Errore durante l'approvazione della richiesta.");
        } catch (HttpServerErrorException ex) {
            LOGGER.error("Errore server backend durante l'approvazione richiesta {}", id, ex);
            return buildError(HttpStatus.BAD_GATEWAY, "Si è verificato un errore nel server backend. Riprova più tardi.");
        } catch (RestClientException ex) {
            LOGGER.error("Errore generico durante l'approvazione richiesta {}", id, ex);
            return buildError(HttpStatus.BAD_GATEWAY, "Impossibile completare l'approvazione al momento. Riprova più tardi.");
        }
    }

    public static class RifiutoRequest {
        private String noteRifiuto;

        public String getNoteRifiuto() {
            return noteRifiuto;
        }

        public void setNoteRifiuto(String noteRifiuto) {
            this.noteRifiuto = noteRifiuto;
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rifiuta(@PathVariable("id") Long id, @RequestBody RifiutoRequest request) {
        if (request == null || request.getNoteRifiuto() == null || request.getNoteRifiuto().trim().isEmpty()) {
            return buildError(HttpStatus.BAD_REQUEST, "La motivazione del rifiuto è obbligatoria.");
        }
        try {
            richiesteClient.rifiuta(id, request.getNoteRifiuto().trim());
            Map<String, Object> body = new HashMap<>();
            body.put("success", true);
            body.put("message", "Richiesta rifiutata con successo.");
            return ResponseEntity.ok(body);
        } catch (HttpClientErrorException.Forbidden ex) {
            LOGGER.warn("Accesso non autorizzato per rifiutare richiesta {}", id, ex);
            return buildError(HttpStatus.FORBIDDEN, "Non sei autorizzato a rifiutare questa richiesta.");
        } catch (HttpClientErrorException.BadRequest ex) {
            LOGGER.warn("Richiesta non più in stato PENDING o non valida per rifiuto {}", id, ex);
            return buildError(HttpStatus.BAD_REQUEST, "La richiesta non può essere rifiutata (forse non è più in stato PENDING).");
        } catch (HttpClientErrorException ex) {
            LOGGER.warn("Errore client durante il rifiuto della richiesta {}", id, ex);
            return buildError(ex.getStatusCode(), "Errore durante il rifiuto della richiesta.");
        } catch (HttpServerErrorException ex) {
            LOGGER.error("Errore server backend durante il rifiuto richiesta {}", id, ex);
            return buildError(HttpStatus.BAD_GATEWAY, "Si è verificato un errore nel server backend. Riprova più tardi.");
        } catch (RestClientException ex) {
            LOGGER.error("Errore generico durante il rifiuto richiesta {}", id, ex);
            return buildError(HttpStatus.BAD_GATEWAY, "Impossibile completare il rifiuto al momento. Riprova più tardi.");
        }
    }

    private ResponseEntity<Map<String, Object>> buildError(HttpStatus status, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }
}
