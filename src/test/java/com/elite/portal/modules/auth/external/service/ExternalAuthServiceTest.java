package com.elite.portal.modules.auth.external.service;

import com.elite.portal.modules.auth.external.dto.ExternalLoginRequestDto;
import com.elite.portal.modules.auth.external.dto.ExternalLoginResponseDto;
import com.elite.portal.modules.auth.security.JwtTokenProvider;
import com.elite.portal.modules.auth.security.LoginAttemptService;
import com.elite.portal.modules.auth.service.PasswordHashingService;
import com.elite.portal.modules.common.exception.BusinessException;
import com.elite.portal.modules.common.exception.ErrorCode;
import com.elite.portal.modules.user.domain.User;
import com.elite.portal.modules.user.enums.UserRole;
import com.elite.portal.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

public class ExternalAuthServiceTest {

    private UserRepository userRepository;
    private PasswordHashingService passwordHashingService;
    private JwtTokenProvider jwtTokenProvider;
    private LoginAttemptService loginAttemptService;
    private ExternalAuthService externalAuthService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        passwordHashingService = Mockito.mock(PasswordHashingService.class);
        jwtTokenProvider = Mockito.mock(JwtTokenProvider.class);
        loginAttemptService = Mockito.mock(LoginAttemptService.class);
        externalAuthService = new ExternalAuthService(userRepository, passwordHashingService, jwtTokenProvider, loginAttemptService);
    }

    @Test
    void login_shouldReturnTokenForValidExternalUser() {
        User user = new User();
        user.setId(1L);
        user.setUsername("external.user");
        user.setEmail("external@elite.com");
        user.setFirstName("Mario");
        user.setLastName("Rossi");
        user.setRole(UserRole.EXTERNAL);
        user.setEnabled(true);
        user.setBanned(false);
        user.setPasswordHash("encoded");

        when(loginAttemptService.isBlocked(anyString(), anyString())).thenReturn(false);
        when(userRepository.findByUsernameOrEmail("external.user", "external.user"))
                .thenReturn(Optional.of(user));
        when(passwordHashingService.matches("Password1!", "encoded")).thenReturn(true);
        when(jwtTokenProvider.generateToken(anyLong(), anyString(), anyString())).thenReturn("jwt-token");
        when(jwtTokenProvider.getAccessTokenValiditySeconds()).thenReturn(3600L);

        ExternalLoginRequestDto requestDto = new ExternalLoginRequestDto("external.user", "Password1!");

        ExternalLoginResponseDto responseDto = externalAuthService.login(requestDto, "127.0.0.1");

        assertNotNull(responseDto);
        assertEquals(1L, responseDto.getUserId());
        assertEquals("jwt-token", responseDto.getAccessToken());
        assertEquals("EXTERNAL", responseDto.getRuolo());
    }

    @Test
    void login_shouldThrowWhenUserNotExternal() {
        User user = new User();
        user.setId(1L);
        user.setUsername("internal.user");
        user.setEmail("internal@elite.com");
        user.setFirstName("Mario");
        user.setLastName("Rossi");
        user.setRole(UserRole.INTERNAL);
        user.setEnabled(true);
        user.setBanned(false);
        user.setPasswordHash("encoded");

        when(loginAttemptService.isBlocked(anyString(), anyString())).thenReturn(false);
        when(userRepository.findByUsernameOrEmail("internal.user", "internal.user"))
                .thenReturn(Optional.of(user));

        ExternalLoginRequestDto requestDto = new ExternalLoginRequestDto("internal.user", "Password1!");

        BusinessException ex = assertThrows(BusinessException.class,
                () -> externalAuthService.login(requestDto, "127.0.0.1"));

        assertEquals(ErrorCode.USER_NOT_EXTERNAL, ex.getErrorCode());
    }

    @Test
    void login_shouldThrowWhenCredentialsInvalid() {
        when(loginAttemptService.isBlocked(anyString(), anyString())).thenReturn(false);
        when(userRepository.findByUsernameOrEmail("unknown", "unknown"))
                .thenReturn(Optional.empty());

        ExternalLoginRequestDto requestDto = new ExternalLoginRequestDto("unknown", "Password1!");

        BusinessException ex = assertThrows(BusinessException.class,
                () -> externalAuthService.login(requestDto, "127.0.0.1"));

        assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
    }
}
