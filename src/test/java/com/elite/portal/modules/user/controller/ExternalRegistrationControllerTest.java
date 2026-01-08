package com.elite.portal.modules.user.controller;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.context.MessageSource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.elite.portal.modules.user.service.ExternalRegistrationService;
import com.elite.portal.modules.user.service.TokenValidationResult;

/**
 * Test di unità per {@link ExternalRegistrationController} basato su MockMvc
 * standalone.
 */
public class ExternalRegistrationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ExternalRegistrationService externalRegistrationService;

    @Mock
    private MessageSource messageSource;

    @InjectMocks
    private ExternalRegistrationController controller;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    public void showRegistrationPage_withValidToken_shouldRenderFormView() throws Exception {
        when(externalRegistrationService.validateRegistrationToken("valid-token"))
                .thenReturn(TokenValidationResult.valid("user@example.com"));
        when(externalRegistrationService.getPasswordPattern()).thenReturn("^(?=.*[A-Z]).{8,64}$");
        when(externalRegistrationService.getPasswordMinLength()).thenReturn(8);
        when(externalRegistrationService.getPasswordMaxLength()).thenReturn(64);

        mockMvc.perform(get("/external/registration").param("token", "valid-token"))
                .andExpect(status().isOk())
                .andExpect(view().name("user/external-registration"))
                .andExpect(model().attributeExists("registrationForm"))
                .andExpect(model().attributeExists("email"))
                .andExpect(model().attribute("tokenValid", true));
    }

    @Test
    public void showRegistrationPage_withInvalidToken_shouldRenderErrorView() throws Exception {
        when(externalRegistrationService.validateRegistrationToken("invalid-token"))
                .thenReturn(TokenValidationResult.invalid("TOKEN_EXPIRED",
                        "external.registration.error.token.expired"));

        mockMvc.perform(get("/external/registration").param("token", "invalid-token"))
                .andExpect(status().isOk())
                .andExpect(view().name("user/external-registration-error"))
                .andExpect(model().attribute("tokenInvalid", true));
    }

    @Test
    public void completeRegistration_withPasswordMismatch_shouldReturnFormWithError() throws Exception {
        when(externalRegistrationService.validateRegistrationToken(anyString()))
                .thenReturn(TokenValidationResult.valid("user@example.com"));
        when(externalRegistrationService.getPasswordPattern()).thenReturn("^(?=.*[A-Z]).{8,64}$");
        when(externalRegistrationService.getPasswordMinLength()).thenReturn(8);
        when(externalRegistrationService.getPasswordMaxLength()).thenReturn(64);

        when(messageSource.getMessage("external.registration.error.password.mismatch", null, null))
                .thenReturn("Le password non coincidono");

        mockMvc.perform(post("/external/registration")
                        .param("token", "valid-token")
                        .param("password", "Password1!")
                        .param("confirmPassword", "Password2!"))
                .andExpect(status().isOk())
                .andExpect(view().name("user/external-registration"))
                .andExpect(model().attributeHasFieldErrors("registrationForm", "confirmPassword"));
    }

    @Test
    public void completeRegistration_withValidData_shouldRenderSuccessView() throws Exception {
        when(messageSource.getMessage("external.registration.success", null, null))
                .thenReturn("Registrazione completata");

        mockMvc.perform(post("/external/registration")
                        .param("token", "valid-token")
                        .param("password", "Password1!")
                        .param("confirmPassword", "Password1!"))
                .andExpect(status().isOk())
                .andExpect(view().name("user/external-registration-success"))
                .andExpect(model().attributeExists("successMessage"));
    }
}
