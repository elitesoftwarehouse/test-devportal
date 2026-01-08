package com.elite.portal.modules.accreditamento.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.ConcurrentModel;
import org.springframework.ui.Model;
import org.springframework.web.client.RestTemplate;

import com.elite.portal.modules.accreditamento.dto.AccreditamentoDettaglioDto;

public class ExternalAccreditamentoStatusControllerTest {

    @Mock
    private RestTemplate restTemplate;

    private ExternalAccreditamentoStatusController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        controller = new ExternalAccreditamentoStatusController(restTemplate, "http://localhost:8080");
    }

    @Test
    void mostraStatoAccreditamento_senzaRichieste_impostaFlagHasRequestFalse() {
        when(restTemplate.getForEntity(anyString(), (Class<Object>) (Class<?>) AccreditamentoDettaglioDto[].class))
                .thenReturn(new ResponseEntity<>(new AccreditamentoDettaglioDto[0], HttpStatus.OK));

        Model model = new ConcurrentModel();
        String viewName = controller.mostraStatoAccreditamento(model);

        assertThat(viewName).isEqualTo("accreditamento/external-accreditamento-status");
        assertThat(model.getAttribute("hasRequest")).isEqualTo(Boolean.FALSE);
        assertThat(model.getAttribute("request")).isNull();
    }

    @Test
    void mostraStatoAccreditamento_conRichiesta_impostaRequestNelModel() {
        AccreditamentoDettaglioDto dto = new AccreditamentoDettaglioDto();
        dto.setId(1L);
        dto.setStato("IN_REVISIONE");
        dto.setDataUltimaModificaStato(OffsetDateTime.now());
        dto.setNoteAmministratore("Note di test");

        AccreditamentoDettaglioDto[] body = new AccreditamentoDettaglioDto[] { dto };

        when(restTemplate.getForEntity(anyString(), (Class<Object>) (Class<?>) AccreditamentoDettaglioDto[].class))
                .thenReturn(new ResponseEntity<>(body, HttpStatus.OK));

        Model model = new ConcurrentModel();
        String viewName = controller.mostraStatoAccreditamento(model);

        assertThat(viewName).isEqualTo("accreditamento/external-accreditamento-status");
        assertThat(model.getAttribute("hasRequest")).isEqualTo(Boolean.TRUE);
        Object requestObj = model.getAttribute("request");
        assertThat(requestObj).isInstanceOf(AccreditamentoDettaglioDto.class);
        AccreditamentoDettaglioDto result = (AccreditamentoDettaglioDto) requestObj;
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getStato()).isEqualTo("IN_REVISIONE");
    }
}
