package com.elite.portal.modules.auth.api;

import com.elite.portal.modules.auth.dto.PasswordResetConfirmRequestDto;
import com.elite.portal.modules.auth.dto.PasswordResetConfirmResponseDto;
import com.elite.portal.modules.auth.service.PasswordResetConfirmService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class PasswordResetConfirmControllerTest {

    private MockMvc mockMvc;

    private PasswordResetConfirmService passwordResetConfirmService;

    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        passwordResetConfirmService = Mockito.mock(PasswordResetConfirmService.class);
        PasswordResetConfirmController controller = new PasswordResetConfirmController(passwordResetConfirmService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
    }

    @Test
    public void testResetPassword_Success() throws Exception {
        PasswordResetConfirmRequestDto requestDto = new PasswordResetConfirmRequestDto("token", "Abcdef1!");
        PasswordResetConfirmResponseDto responseDto = new PasswordResetConfirmResponseDto(true, "La password è stata aggiornata correttamente.");

        Mockito.when(passwordResetConfirmService.resetPassword(Mockito.any(PasswordResetConfirmRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post("/api/auth/password/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(content().json(objectMapper.writeValueAsString(responseDto)));
    }

    @Test
    public void testResetPassword_Failure() throws Exception {
        PasswordResetConfirmRequestDto requestDto = new PasswordResetConfirmRequestDto("token", "weak");
        PasswordResetConfirmResponseDto responseDto = new PasswordResetConfirmResponseDto(false, "Password non valida");

        Mockito.when(passwordResetConfirmService.resetPassword(Mockito.any(PasswordResetConfirmRequestDto.class)))
                .thenReturn(responseDto);

        mockMvc.perform(post("/api/auth/password/reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().json(objectMapper.writeValueAsString(responseDto)));
    }
}
