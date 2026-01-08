package com.elite.portal.modules.auth.controller;

import com.elite.portal.modules.auth.dto.ExternalRegistrationRequest;
import com.elite.portal.modules.auth.dto.ExternalRegistrationResponse;
import com.elite.portal.modules.auth.service.ExternalRegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class ExternalRegistrationControllerTest {

    private MockMvc mockMvc;
    private ExternalRegistrationService externalRegistrationService;

    @BeforeEach
    public void setUp() {
        externalRegistrationService = Mockito.mock(ExternalRegistrationService.class);
        ExternalRegistrationController controller = new ExternalRegistrationController(externalRegistrationService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    public void testShowRegistrationForm() throws Exception {
        mockMvc.perform(get("/public/external-registration"))
                .andExpect(status().isOk());
    }

    @Test
    public void testRegisterExternalSuccess() throws Exception {
        ExternalRegistrationResponse serviceResponse = new ExternalRegistrationResponse();
        serviceResponse.setSuccess(true);
        serviceResponse.setMessage("OK");

        Mockito.when(externalRegistrationService.registerExternal(Mockito.any(ExternalRegistrationRequest.class)))
                .thenReturn(serviceResponse);

        mockMvc.perform(post("/public/external-registration")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("subjectType", "PROFESSIONAL")
                        .param("email", "test@example.com")
                        .param("password", "Password123")
                        .param("confirmPassword", "Password123")
                        .param("privacyAccepted", "true")
                        .param("termsAccepted", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
