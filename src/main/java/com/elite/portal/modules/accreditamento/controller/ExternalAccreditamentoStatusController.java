package com.elite.portal.modules.accreditamento.controller;

import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.elite.portal.modules.accreditamento.dto.AccreditamentoDettaglioDto;

/**
 * Controller per la vista utente esterno relativa allo stato della richiesta di accreditamento.
 *
 * Espone una pagina che mostra:
 * - stato corrente della richiesta;
 * - ultima modifica di stato;
 * - eventuali note dell'amministratore;
 * - messaggio guida in assenza di richiesta esistente.
 */
@Controller
@RequestMapping("/esterno/accreditamento")
public class ExternalAccreditamentoStatusController {

    private static final Logger LOG = LoggerFactory.getLogger(ExternalAccreditamentoStatusController.class);

    private final RestTemplate restTemplate;
    private final String accreditamentiServiceBaseUrl;

    public ExternalAccreditamentoStatusController(
            RestTemplate restTemplate,
            @Value("${services.accreditamenti.base-url:http://localhost:8080}") String accreditamentiServiceBaseUrl) {
        this.restTemplate = restTemplate;
        this.accreditamentiServiceBaseUrl = accreditamentiServiceBaseUrl;
    }

    @GetMapping("/stato")
    public String mostraStatoAccreditamento(Model model) {
        List<AccreditamentoDettaglioDto> richieste = recuperaMieRichiesteAccreditamento();

        if (richieste.isEmpty()) {
            model.addAttribute("hasRequest", Boolean.FALSE);
            model.addAttribute("request", null);
        } else {
            // Nel caso di più richieste, per coerenza si mostra la più recente.
            AccreditamentoDettaglioDto richiestaCorrente = richieste.get(0);
            model.addAttribute("hasRequest", Boolean.TRUE);
            model.addAttribute("request", richiestaCorrente);
        }

        return "accreditamento/external-accreditamento-status";
    }

    private List<AccreditamentoDettaglioDto> recuperaMieRichiesteAccreditamento() {
        String url = accreditamentiServiceBaseUrl + "/accreditamenti/mie";
        try {
            ResponseEntity<AccreditamentoDettaglioDto[]> response = restTemplate.getForEntity(url,
                    AccreditamentoDettaglioDto[].class);
            AccreditamentoDettaglioDto[] body = response.getBody();
            if (body == null || body.length == 0) {
                return Collections.emptyList();
            }
            return List.of(body);
        } catch (RestClientException ex) {
            LOG.warn("Errore durante il recupero delle richieste di accreditamento dell'utente esterno", ex);
            return Collections.emptyList();
        }
    }
}
