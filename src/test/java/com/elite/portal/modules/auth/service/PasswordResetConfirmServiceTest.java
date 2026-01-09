package com.elite.portal.modules.auth.service;

import com.elite.portal.modules.auth.domain.PasswordResetToken;
import com.elite.portal.modules.auth.dto.PasswordResetConfirmRequestDto;
import com.elite.portal.modules.auth.dto.PasswordResetConfirmResponseDto;
import com.elite.portal.modules.auth.repository.PasswordResetTokenRepository;
import com.elite.portal.modules.user.domain.ExternalUser;
import com.elite.portal.modules.user.repository.ExternalUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class PasswordResetConfirmServiceTest {

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private ExternalUserRepository externalUserRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PasswordPolicyService passwordPolicyService;

    @Mock
    private SessionInvalidationService sessionInvalidationService;

    @InjectMocks
    private PasswordResetConfirmService passwordResetConfirmService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testResetPassword_Success() {
        String tokenValue = "valid-token";
        String newPassword = "Abcdef1!";

        ExternalUser user = new ExternalUser();
        user.setId(1L);
        user.setActive(true);

        PasswordResetToken token = new PasswordResetToken();
        token.setId(10L);
        token.setToken(tokenValue);
        token.setExternalUser(user);
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setCreatedAt(LocalDateTime.now().minusMinutes(5));

        when(passwordResetTokenRepository.findByToken(tokenValue)).thenReturn(Optional.of(token));
        when(passwordPolicyService.isValid(newPassword)).thenReturn(true);
        when(passwordEncoder.encode(newPassword)).thenReturn("encoded-password");

        PasswordResetConfirmRequestDto requestDto = new PasswordResetConfirmRequestDto(tokenValue, newPassword);

        PasswordResetConfirmResponseDto responseDto = passwordResetConfirmService.resetPassword(requestDto);

        assertTrue(responseDto.isSuccess());
        assertEquals("La password è stata aggiornata correttamente.", responseDto.getMessage());

        ArgumentCaptor<ExternalUser> userCaptor = ArgumentCaptor.forClass(ExternalUser.class);
        verify(externalUserRepository).save(userCaptor.capture());
        assertEquals("encoded-password", userCaptor.getValue().getPassword());

        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(tokenCaptor.capture());
        assertTrue(tokenCaptor.getValue().isUsed());

        verify(sessionInvalidationService).invalidateSessionsForUser(user);
    }

    @Test
    public void testResetPassword_InvalidToken() {
        String tokenValue = "invalid-token";
        String newPassword = "Abcdef1!";

        when(passwordResetTokenRepository.findByToken(tokenValue)).thenReturn(Optional.empty());

        PasswordResetConfirmRequestDto requestDto = new PasswordResetConfirmRequestDto(tokenValue, newPassword);
        PasswordResetConfirmResponseDto responseDto = passwordResetConfirmService.resetPassword(requestDto);

        assertFalse(responseDto.isSuccess());
        assertEquals("Impossibile completare il reset della password.", responseDto.getMessage());
    }

    @Test
    public void testResetPassword_ExpiredToken() {
        String tokenValue = "expired-token";
        String newPassword = "Abcdef1!";

        ExternalUser user = new ExternalUser();
        user.setId(1L);
        user.setActive(true);

        PasswordResetToken token = new PasswordResetToken();
        token.setId(11L);
        token.setToken(tokenValue);
        token.setExternalUser(user);
        token.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        token.setCreatedAt(LocalDateTime.now().minusHours(2));

        when(passwordResetTokenRepository.findByToken(tokenValue)).thenReturn(Optional.of(token));

        PasswordResetConfirmRequestDto requestDto = new PasswordResetConfirmRequestDto(tokenValue, newPassword);
        PasswordResetConfirmResponseDto responseDto = passwordResetConfirmService.resetPassword(requestDto);

        assertFalse(responseDto.isSuccess());
        assertEquals("Impossibile completare il reset della password.", responseDto.getMessage());
    }

    @Test
    public void testResetPassword_InactiveUser() {
        String tokenValue = "token";
        String newPassword = "Abcdef1!";

        ExternalUser user = new ExternalUser();
        user.setId(1L);
        user.setActive(false);

        PasswordResetToken token = new PasswordResetToken();
        token.setId(12L);
        token.setToken(tokenValue);
        token.setExternalUser(user);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        token.setCreatedAt(LocalDateTime.now().minusMinutes(5));

        when(passwordResetTokenRepository.findByToken(tokenValue)).thenReturn(Optional.of(token));

        PasswordResetConfirmRequestDto requestDto = new PasswordResetConfirmRequestDto(tokenValue, newPassword);
        PasswordResetConfirmResponseDto responseDto = passwordResetConfirmService.resetPassword(requestDto);

        assertFalse(responseDto.isSuccess());
        assertEquals("Impossibile completare il reset della password.", responseDto.getMessage());
    }

    @Test
    public void testResetPassword_InvalidPasswordPolicy() {
        String tokenValue = "valid-token";
        String newPassword = "weak";

        ExternalUser user = new ExternalUser();
        user.setId(1L);
        user.setActive(true);

        PasswordResetToken token = new PasswordResetToken();
        token.setId(13L);
        token.setToken(tokenValue);
        token.setExternalUser(user);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        token.setCreatedAt(LocalDateTime.now().minusMinutes(5));

        when(passwordResetTokenRepository.findByToken(tokenValue)).thenReturn(Optional.of(token));
        when(passwordPolicyService.isValid(newPassword)).thenReturn(false);
        when(passwordPolicyService.getValidationMessage()).thenReturn("Password non valida");

        PasswordResetConfirmRequestDto requestDto = new PasswordResetConfirmRequestDto(tokenValue, newPassword);
        PasswordResetConfirmResponseDto responseDto = passwordResetConfirmService.resetPassword(requestDto);

        assertFalse(responseDto.isSuccess());
        assertEquals("Password non valida", responseDto.getMessage());
    }
}
