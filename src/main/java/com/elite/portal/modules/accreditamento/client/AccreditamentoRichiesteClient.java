package com.elite.portal.modules.accreditamento.client;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.elite.portal.modules.accreditamento.dto.AccreditamentoRichiestaDettaglioDto;
import com.elite.portal.modules.accreditamento.dto.AccreditamentoRichiestaFilterDto;
import com.elite.portal.modules.accreditamento.dto.AccreditamentoRichiestaListItemDto;
import com.elite.portal.shared.config.BackendApiProperties;

/**
 * Client di integrazione verso le API backend per la gestione delle richieste di accreditamento.
 */
@Component
public class AccreditamentoRichiesteClient {

    private final RestTemplate restTemplate;
    private final BackendApiProperties backendApiProperties;

    @Autowired
    public AccreditamentoRichiesteClient(RestTemplate restTemplate, BackendApiProperties backendApiProperties) {
        this.restTemplate = restTemplate;
        this.backendApiProperties = backendApiProperties;
    }

    public List<AccreditamentoRichiestaListItemDto> search(AccreditamentoRichiestaFilterDto filter) throws RestClientException {
        UriComponentsBuilder builder = UriComponentsBuilder
            .fromHttpUrl(backendApiProperties.getBaseUrl() + "/accreditamento/richieste");

        if (filter.getStato() != null && !filter.getStato().isEmpty()) {
            builder.queryParam("stato", filter.getStato());
        }
        if (filter.getQuery() != null && !filter.getQuery().isEmpty()) {
            builder.queryParam("q", filter.getQuery());
        }

        ResponseEntity<List<AccreditamentoRichiestaListItemDto>> response = restTemplate.exchange(
            builder.build().toUri(),
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<List<AccreditamentoRichiestaListItemDto>>() {}
        );

        return response.getBody();
    }

    public AccreditamentoRichiestaDettaglioDto getDettaglio(Long id) throws RestClientException {
        String url = backendApiProperties.getBaseUrl() + "/accreditamento/richieste/" + id;
        ResponseEntity<AccreditamentoRichiestaDettaglioDto> response = restTemplate.getForEntity(url, AccreditamentoRichiestaDettaglioDto.class);
        return response.getBody();
    }

    public void approva(Long id) throws RestClientException {
        String url = backendApiProperties.getBaseUrl() + "/accreditamento/richieste/" + id + "/approve";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(null, headers);
        restTemplate.postForEntity(url, entity, Void.class);
    }

    public void rifiuta(Long id, String noteRifiuto) throws RestClientException {
        String url = backendApiProperties.getBaseUrl() + "/accreditamento/richieste/" + id + "/reject";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(Map.of("note_rifiuto", noteRifiuto), headers);
        restTemplate.postForEntity(url, entity, Void.class);
    }
}
