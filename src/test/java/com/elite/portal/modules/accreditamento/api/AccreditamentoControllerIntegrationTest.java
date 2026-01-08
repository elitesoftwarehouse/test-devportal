package com.elite.portal.modules.accreditamento.api;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.elite.portal.modules.accreditamento.model.AccreditamentoRequest;
import com.elite.portal.modules.accreditamento.service.AccreditamentoService;
import com.elite.portal.modules.accreditamento.service.AccreditamentoServiceImpl;

@WebMvcTest(controllers = AccreditamentoController.class)
@Import({AccreditamentoServiceImpl.class})
public class AccreditamentoControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AccreditamentoService accreditamentoService;

    private Clock fixedClock;

    @BeforeEach
    void setUp() {
        fixedClock = Clock.fixed(Instant.parse("2024-01-01T10:15:30.00Z"), ZoneOffset.UTC);
    }

    @Test
    @WithMockUser(username = "1")
    void postAccreditamenti_shouldCreateRequestAndReturn201() throws Exception {
        AccreditamentoRequest created = new AccreditamentoRequest();
        created.setId(10L);
        created.setEmail("user@example.com");
        created.setFirstName("Mario");
        created.setLastName("Rossi");
        created.setStatus("PENDING");
        created.setCreatedAt(Instant.parse("2024-01-01T10:15:30.00Z"));
        created.setUpdatedAt(Instant.parse("2024-01-01T10:15:30.00Z"));
        created.setUserId(1L);

        given(accreditamentoService.createAccreditamento(any(AccreditamentoRequest.class))).willReturn(created);

        String payload = "{" +
                "\"email\":\"user@example.com\"," +
                "\"firstName\":\"Mario\"," +
                "\"lastName\":\"Rossi\"" +
                "}";

        mockMvc.perform(post("/accreditamenti")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.email", is("user@example.com")))
                .andExpect(jsonPath("$.status", is("PENDING")));
    }

    @Test
    @WithMockUser(username = "1")
    void postAccreditamenti_withInvalidBody_shouldReturn400() throws Exception {
        String payload = "{" +
                "\"email\":\"not-an-email\"," +
                "\"firstName\":\"\"," +
                "\"lastName\":\"Rossi\"" +
                "}";

        mockMvc.perform(post("/accreditamenti")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest());
    }

    @Test
    void postAccreditamenti_unauthenticated_shouldReturn401() throws Exception {
        String payload = "{" +
                "\"email\":\"user@example.com\"," +
                "\"firstName\":\"Mario\"," +
                "\"lastName\":\"Rossi\"" +
                "}";

        mockMvc.perform(post("/accreditamenti")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "1")
    void getAccreditamenti_shouldReturnRequestForOwner() throws Exception {
        AccreditamentoRequest request = new AccreditamentoRequest();
        request.setId(10L);
        request.setEmail("user@example.com");
        request.setFirstName("Mario");
        request.setLastName("Rossi");
        request.setStatus("PENDING");
        request.setCreatedAt(Instant.parse("2024-01-01T10:15:30.00Z"));
        request.setUpdatedAt(Instant.parse("2024-01-01T10:15:30.00Z"));
        request.setUserId(1L);

        given(accreditamentoService.getByIdAndUser(10L, 1L)).willReturn(request);

        mockMvc.perform(get("/accreditamenti/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.email", is("user@example.com")));
    }

    @Test
    @WithMockUser(username = "2")
    void getAccreditamenti_otherUser_shouldReturn403() throws Exception {
        AccreditamentoRequest request = new AccreditamentoRequest();
        request.setId(10L);
        request.setUserId(1L);

        given(accreditamentoService.getByIdAndUser(10L, 2L)).willReturn(request);

        mockMvc.perform(get("/accreditamenti/10"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "1")
    void getAccreditamenti_notFound_shouldReturn404() throws Exception {
        given(accreditamentoService.getByIdAndUser(999L, 1L)).willReturn(null);

        mockMvc.perform(get("/accreditamenti/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAccreditamenti_unauthenticated_shouldReturn401() throws Exception {
        mockMvc.perform(get("/accreditamenti/10"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string(containsString("Unauthorized")));
    }
}
