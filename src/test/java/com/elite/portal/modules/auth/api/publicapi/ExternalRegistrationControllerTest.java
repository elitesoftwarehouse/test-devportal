package com.elite.portal.modules.auth.api.publicapi;

import com.elite.portal.modules.auth.application.ExternalRegistrationService;
import com.elite.portal.modules.auth.application.dto.ExternalRegistrationRequestDto;
import com.elite.portal.modules.auth.application.dto.ExternalRegistrationResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Locale;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ExternalRegistrationController.class)
public class ExternalRegistrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExternalRegistrationService externalRegistrationService;

    private ExternalRegistrationRequestDto validRequest;

    @BeforeEach
    void setUp() {
        validRequest = new ExternalRegistrationRequestDto();
        validRequest.setType("PROFESSIONAL");
        validRequest.setEmail("test@example.com");
        validRequest.setPassword("Abcd1234!");
        validRequest.setTermsAccepted(true);
        validRequest.setPrivacyAccepted(true);
        validRequest.setFirstName("Mario");
        validRequest.setLastName("Rossi");
    }

    @Test
    void registerExternalUser_returnsCreatedOnValidRequest() throws Exception {
        ExternalRegistrationResponseDto responseDto = new ExternalRegistrationResponseDto();
        responseDto.setId(UUID.randomUUID());
        responseDto.setType("PROFESSIONAL");
        responseDto.setStatus("REGISTERED_PENDING_ACCREDITATION");
        responseDto.setEmail(validRequest.getEmail());
        responseDto.setCanRequestAccreditation(true);
        responseDto.setEmailConfirmationRequired(true);

        when(externalRegistrationService.registerExternalUser(ArgumentMatchers.any(ExternalRegistrationRequestDto.class),
                ArgumentMatchers.any(Locale.class))).thenReturn(responseDto);

        mockMvc.perform(post("/api/public/external-registration")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.type").value("PROFESSIONAL"))
                .andExpect(jsonPath("$.status").value("REGISTERED_PENDING_ACCREDITATION"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.canRequestAccreditation").value(true));
    }

    @Test
    void registerExternalUser_returnsBadRequestOnMissingEmail() throws Exception {
        validRequest.setEmail("");

        mockMvc.perform(post("/api/public/external-registration")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }
}
