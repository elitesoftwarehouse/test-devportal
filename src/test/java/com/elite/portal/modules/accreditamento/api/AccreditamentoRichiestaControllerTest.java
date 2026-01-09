package com.elite.portal.modules.accreditamento.api;

import com.elite.portal.modules.accreditamento.api.dto.AccreditamentoRichiestaCreateRequest;
import com.elite.portal.modules.accreditamento.domain.AccreditamentoRichiesta;
import com.elite.portal.modules.accreditamento.domain.AccreditamentoStato;
import com.elite.portal.modules.accreditamento.repository.AccreditamentoRichiestaRepository;
import com.elite.portal.modules.accreditamento.service.CurrentUserProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AccreditamentoRichiestaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccreditamentoRichiestaRepository repository;

    @MockBean
    private CurrentUserProvider currentUserProvider;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
        given(currentUserProvider.getCurrentUserIdOrNull()).willReturn(1L);
        given(currentUserProvider.getCurrentUserEmailOrNull()).willReturn("user@test.it");
    }

    @Test
    void creaRichiesta_deveRestituire201ELocation() throws Exception {
        AccreditamentoRichiestaCreateRequest request = new AccreditamentoRichiestaCreateRequest();
        request.setEmail("user@test.it");
        request.setNome("Mario");
        request.setCognome("Rossi");
        request.setAzienda("ACME");
        request.setNote("Nota di test");

        String payload = objectMapper.writeValueAsString(request);

        mockMvc.perform(post("/api/accreditamenti")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"));

        assertThat(repository.count()).isEqualTo(1);
        AccreditamentoRichiesta saved = repository.findAll().get(0);
        assertThat(saved.getStato()).isEqualTo(AccreditamentoStato.INVIATA);
        assertThat(saved.getUserId()).isEqualTo(1L);
    }

    @Test
    void getRichiesta_deveRestituire404SeNonAccessibile() throws Exception {
        AccreditamentoRichiesta other = new AccreditamentoRichiesta();
        other.setEmail("altro@test.it");
        other.setNome("Altro");
        other.setCognome("Utente");
        other.setStato(AccreditamentoStato.INVIATA);
        other.setCreatedAt(OffsetDateTime.now());
        other.setUpdatedAt(OffsetDateTime.now());
        other.setUserId(99L);
        repository.save(other);

        mockMvc.perform(get("/api/accreditamenti/" + other.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void getMieRichieste_deveRestituireLista() throws Exception {
        AccreditamentoRichiesta r1 = new AccreditamentoRichiesta();
        r1.setEmail("user@test.it");
        r1.setNome("Mario");
        r1.setCognome("Rossi");
        r1.setStato(AccreditamentoStato.INVIATA);
        r1.setCreatedAt(OffsetDateTime.now());
        r1.setUpdatedAt(OffsetDateTime.now());
        r1.setUserId(1L);
        repository.save(r1);

        mockMvc.perform(get("/api/accreditamenti/mie"))
                .andExpect(status().isOk());
    }
}
