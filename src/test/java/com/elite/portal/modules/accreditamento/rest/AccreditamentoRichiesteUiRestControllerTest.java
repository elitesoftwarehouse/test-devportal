package com.elite.portal.modules.accreditamento.rest;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;

import com.elite.portal.modules.accreditamento.client.AccreditamentoRichiesteClient;
import com.elite.portal.modules.accreditamento.dto.AccreditamentoRichiestaDettaglioDto;
import com.elite.portal.modules.accreditamento.dto.AccreditamentoRichiestaFilterDto;
import com.elite.portal.modules.accreditamento.dto.AccreditamentoRichiestaListItemDto;

/**
 * Test di base per AccreditamentoRichiesteUiRestController.
 * Verifica la corretta esposizione dei principali endpoint e la gestione errori.
 */
public class AccreditamentoRichiesteUiRestControllerTest {

    @Mock
    private AccreditamentoRichiesteClient richiesteClient;

    @InjectMocks
    private AccreditamentoRichiesteUiRestController controller;

    private MockMvc mockMvc;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    public void testSearchReturnsList() throws Exception {
        AccreditamentoRichiestaListItemDto item = new AccreditamentoRichiestaListItemDto();
        item.setId(1L);
        item.setRichiedente("Mario Rossi");
        item.setStato("PENDING");

        when(richiesteClient.search(any(AccreditamentoRichiestaFilterDto.class)))
            .thenReturn(Collections.singletonList(item));

        mockMvc.perform(get("/ui/api/accreditamento/richieste")
                .param("stato", "PENDING"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id", is(1)))
            .andExpect(jsonPath("$[0].richiedente", is("Mario Rossi")))
            .andExpect(jsonPath("$[0].stato", is("PENDING")));
    }

    @Test
    public void testDettaglioFound() throws Exception {
        AccreditamentoRichiestaDettaglioDto dettaglio = new AccreditamentoRichiestaDettaglioDto();
        dettaglio.setId(5L);
        dettaglio.setRichiedente("Anna Bianchi");

        when(richiesteClient.getDettaglio(5L)).thenReturn(dettaglio);

        mockMvc.perform(get("/ui/api/accreditamento/richieste/5"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id", is(5)))
            .andExpect(jsonPath("$.richiedente", is("Anna Bianchi")));
    }

    @Test
    public void testApprovaOk() throws Exception {
        doNothing().when(richiesteClient).approva(10L);

        mockMvc.perform(post("/ui/api/accreditamento/richieste/10/approve")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success", is(true)))
            .andExpect(jsonPath("$.message", is("Richiesta approvata con successo.")));
    }

    @Test
    public void testRifiutaWithoutMotivationReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/ui/api/accreditamento/richieste/11/reject")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success", is(false)))
            .andExpect(jsonPath("$.message", is("La motivazione del rifiuto è obbligatoria.")));
    }

    @Test
    public void testRifiutaOk() throws Exception {
        doNothing().when(richiesteClient).rifiuta(eq(11L), eq("Motivo"));

        mockMvc.perform(post("/ui/api/accreditamento/richieste/11/reject")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"noteRifiuto\":\"Motivo\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success", is(true)))
            .andExpect(jsonPath("$.message", is("Richiesta rifiutata con successo.")));
    }
}
