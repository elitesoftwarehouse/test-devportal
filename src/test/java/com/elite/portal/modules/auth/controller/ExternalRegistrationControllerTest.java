package com.elite.portal.modules.auth.controller;

import com.elite.portal.modules.auth.dto.ExternalUserRegistrationRequest;
import com.elite.portal.modules.auth.dto.ExternalUserRegistrationResponse;
import com.elite.portal.modules.auth.model.ExternalUserType;
import com.elite.portal.modules.auth.service.ExternalRegistrationService;
import com.elite.portal.shared.logging.AppLogger;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.hamcrest.Matchers.is;

/**
 * Test per ExternalRegistrationController.
 * Verifica la registrazione di utenti esterni via API REST.
 */
public class ExternalRegistrationControllerTest {

    private MockMvc mockMvc;
    private ExternalRegistrationService externalRegistrationService;
    private AppLogger appLogger;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        externalRegistrationService = Mockito.mock(ExternalRegistrationService.class);
        appLogger = Mockito.mock(AppLogger.class);
        ExternalRegistrationController controller = new ExternalRegistrationController(externalRegistrationService, appLogger);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    void registerExternal_professionista_returnsCreated() throws Exception {
        ExternalUserRegistrationRequest request = new ExternalUserRegistrationRequest();
        request.setUserType(ExternalUserType.PROFESSIONISTA);
        request.setFirstName("Mario");
        request.setLastName("Rossi");
        request.setEmail("mario.rossi@example.com");
        request.setPassword("Password1!");

        Mockito.when(externalRegistrationService.registerExternalUser(any()))
                .thenReturn(new ExternalUserRegistrationResponse(1L, "Registrazione completata"));

        mockMvc.perform(post("/api/auth/register-external")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId", is(1)));
    }

    @Test
    void registerExternal_referenteAziendale_returnsCreated() throws Exception {
        ExternalUserRegistrationRequest request = new ExternalUserRegistrationRequest();
        request.setUserType(ExternalUserType.REFERENTE_AZIENDALE);
        request.setFirstName("Luigi");
        request.setLastName("Verdi");
        request.setEmail("luigi.verdi@azienda.com");
        request.setPassword("SecurePass123!");

        Mockito.when(externalRegistrationService.registerExternalUser(any()))
                .thenReturn(new ExternalUserRegistrationResponse(2L, "Registrazione completata"));

        mockMvc.perform(post("/api/auth/register-external")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId", is(2)));
    }

    @Test
    void registerExternal_missingEmail_returnsBadRequest() throws Exception {
        ExternalUserRegistrationRequest request = new ExternalUserRegistrationRequest();
        request.setUserType(ExternalUserType.PROFESSIONISTA);
        request.setFirstName("Mario");
        request.setLastName("Rossi");
        request.setPassword("Password1!");
        // email mancante

        mockMvc.perform(post("/api/auth/register-external")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
