package com.elite.portal.modules.registration.api;

import com.elite.portal.modules.registration.dto.ExternalCompanyRegistrationRequest;
import com.elite.portal.modules.registration.dto.ExternalProfessionalRegistrationRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ExternalRegistrationValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Mancanza di campi obbligatori per professionista genera VALIDATION_ERROR")
    void missingRequiredFieldsProfessional_shouldReturnValidationError() throws Exception {
        ExternalProfessionalRegistrationRequest request = new ExternalProfessionalRegistrationRequest();
        request.setEmail(null);
        request.setFirstName(null);
        request.setLastName(null);
        request.setPassword("Password123!");
        request.setAcceptPrivacy(true);
        request.setAcceptTerms(true);

        mockMvc.perform(post("/api/registration/external/professional")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }

    @Test
    @DisplayName("Mancanza di campi obbligatori per azienda genera VALIDATION_ERROR")
    void missingRequiredFieldsCompany_shouldReturnValidationError() throws Exception {
        ExternalCompanyRegistrationRequest request = new ExternalCompanyRegistrationRequest();
        request.setEmail("company.validation@test.com");
        request.setCompanyName(null);
        request.setVatNumber(null);
        request.setPassword("Password123!");
        request.setAcceptPrivacy(true);
        request.setAcceptTerms(true);

        mockMvc.perform(post("/api/registration/external/company")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));
    }
}
