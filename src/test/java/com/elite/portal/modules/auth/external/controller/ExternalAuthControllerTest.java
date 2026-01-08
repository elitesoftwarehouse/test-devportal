package com.elite.portal.modules.auth.external.controller;

import com.elite.portal.modules.auth.external.dto.ExternalLoginRequestDto;
import com.elite.portal.modules.auth.external.dto.ExternalLoginResponseDto;
import com.elite.portal.modules.auth.external.service.ExternalAuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ExternalAuthController.class)
public class ExternalAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExternalAuthService externalAuthService;

    private ExternalLoginResponseDto successResponse;

    @BeforeEach
    void setUp() {
        successResponse = new ExternalLoginResponseDto(1L, "Mario", "Rossi", "EXTERNAL", "token-123", 3600L);
    }

    @Test
    void login_shouldReturnOkWhenCredentialsAreValid() throws Exception {
        Mockito.when(externalAuthService.login(any(ExternalLoginRequestDto.class), anyString()))
                .thenReturn(successResponse);

        ExternalLoginRequestDto requestDto = new ExternalLoginRequestDto("mario.rossi", "Password1!");

        mockMvc.perform(post("/api/auth/external/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.nome").value("Mario"))
                .andExpect(jsonPath("$.accessToken").value("token-123"));
    }
}
