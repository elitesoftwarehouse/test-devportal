package com.elite.portal.modules.user.auth.service;

import com.elite.portal.core.entity.User;
import com.elite.portal.core.entity.UserStatus;
import com.elite.portal.core.repository.UserRepository;
import com.elite.portal.modules.user.auth.dto.ExternalCompleteRegistrationRequest;
import com.elite.portal.modules.user.auth.dto.ExternalCompleteRegistrationResponse;
import com.elite.portal.modules.user.auth.dto.ExternalRegistrationErrorCode;
import com.elite.portal.modules.user.auth.entity.RegistrationToken;
import com.elite.portal.modules.user.auth.repository.RegistrationTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ExternalRegistrationServiceTest {

    @Mock
    private RegistrationTokenRepository registrationTokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordPolicyValidator passwordPolicyValidator;

    @InjectMocks
    private ExternalRegistrationService externalRegistrationService;

    private RegistrationToken token;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setStatus(UserStatus.APPROVED_PENDING_REGISTRATION);

        token = new RegistrationToken();
        token.setId(10L);
        token.setToken("valid-token");
        token.setUser(user);
        token.setExpiresAt(OffsetDateTime.now().plusHours(1));
        token.setUsed(false);
    }

    @Test
    void completeRegistration_success() {
        ExternalCompleteRegistrationRequest request = new ExternalCompleteRegistrationRequest("valid-token", "ValidPassw0rd!");

        when(registrationTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));
        when(passwordPolicyValidator.isPasswordValid("ValidPassw0rd!")).thenReturn(true);

        ExternalCompleteRegistrationResponse response = externalRegistrationService.completeRegistration(request);

        assertTrue(response.isSuccess());
        assertEquals("Registrazione completata con successo", response.getMessage());
        assertEquals(null, response.getErrorCode());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User savedUser = userCaptor.getValue();
        assertEquals(UserStatus.ACTIVE, savedUser.getStatus());
        assertNotNull(savedUser.getPasswordHash());
        assertNotNull(savedUser.getRegistrationCompletedAt());

        ArgumentCaptor<RegistrationToken> tokenCaptor = ArgumentCaptor.forClass(RegistrationToken.class);
        verify(registrationTokenRepository).save(tokenCaptor.capture());
        RegistrationToken savedToken = tokenCaptor.getValue();
        assertTrue(savedToken.isUsed());
        assertNotNull(savedToken.getUsedAt());
    }

    @Test
    void completeRegistration_tokenNotFound() {
        ExternalCompleteRegistrationRequest request = new ExternalCompleteRegistrationRequest("missing-token", "ValidPassw0rd!");

        when(registrationTokenRepository.findByToken("missing-token")).thenReturn(Optional.empty());

        ExternalCompleteRegistrationResponse response = externalRegistrationService.completeRegistration(request);

        assertFalse(response.isSuccess());
        assertEquals(ExternalRegistrationErrorCode.TOKEN_INVALIDO, response.getErrorCode());
    }

    @Test
    void completeRegistration_tokenAlreadyUsed() {
        token.setUsed(true);
        ExternalCompleteRegistrationRequest request = new ExternalCompleteRegistrationRequest("valid-token", "ValidPassw0rd!");

        when(registrationTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));

        ExternalCompleteRegistrationResponse response = externalRegistrationService.completeRegistration(request);

        assertFalse(response.isSuccess());
        assertEquals(ExternalRegistrationErrorCode.TOKEN_GIA_UTILIZZATO, response.getErrorCode());
    }

    @Test
    void completeRegistration_tokenExpired() {
        token.setExpiresAt(OffsetDateTime.now().minusMinutes(1));
        ExternalCompleteRegistrationRequest request = new ExternalCompleteRegistrationRequest("valid-token", "ValidPassw0rd!");

        when(registrationTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));

        ExternalCompleteRegistrationResponse response = externalRegistrationService.completeRegistration(request);

        assertFalse(response.isSuccess());
        assertEquals(ExternalRegistrationErrorCode.TOKEN_SCADUTO, response.getErrorCode());
    }

    @Test
    void completeRegistration_userStatusNotPending() {
        user.setStatus(UserStatus.ACTIVE);
        ExternalCompleteRegistrationRequest request = new ExternalCompleteRegistrationRequest("valid-token", "ValidPassw0rd!");

        when(registrationTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));

        ExternalCompleteRegistrationResponse response = externalRegistrationService.completeRegistration(request);

        assertFalse(response.isSuccess());
        assertEquals(ExternalRegistrationErrorCode.TOKEN_INVALIDO, response.getErrorCode());
    }

    @Test
    void completeRegistration_passwordNotValid() {
        ExternalCompleteRegistrationRequest request = new ExternalCompleteRegistrationRequest("valid-token", "weak");

        when(registrationTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(token));
        when(passwordPolicyValidator.isPasswordValid("weak")).thenReturn(false);

        ExternalCompleteRegistrationResponse response = externalRegistrationService.completeRegistration(request);

        assertFalse(response.isSuccess());
        assertEquals(ExternalRegistrationErrorCode.PASSWORD_NON_VALIDA, response.getErrorCode());
    }
}
