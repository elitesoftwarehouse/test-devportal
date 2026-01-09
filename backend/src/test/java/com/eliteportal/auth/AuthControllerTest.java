package com.eliteportal.auth;

import com.eliteportal.config.EmailProperties;
import com.eliteportal.email.EmailService;
import com.eliteportal.user.User;
import com.eliteportal.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.ResponseEntity;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    private UserRepository userRepository;
    private EmailService emailService;
    private EmailProperties emailProperties;
    private AuthController authController;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        emailService = mock(EmailService.class);
        emailProperties = new EmailProperties();
        emailProperties.setPortalBaseUrl("https://portal.test");
        emailProperties.setActivationValidityHours(24);
        authController = new AuthController(userRepository, emailService, emailProperties);
    }

    @Test
    void register_ShouldCreateUserAndSendEmail() {
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("test@example.com");
        request.setFirstName("Mario");
        request.setLastName("Rossi");
        request.setRequestedRole("EXTERNAL_USER");
        request.setLocale("it");

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<RegistrationResponse> response = authController.register(request);

        assertEquals(201, response.getStatusCodeValue());
        assertTrue(response.getBody().isSuccess());
        assertNotNull(response.getBody().getMessage());

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        ArgumentCaptor<String> linkCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> localeCaptor = ArgumentCaptor.forClass(String.class);

        verify(emailService, times(1)).sendActivationEmail(userCaptor.capture(), linkCaptor.capture(), localeCaptor.capture());
        assertEquals("test@example.com", userCaptor.getValue().getEmail());
        assertTrue(linkCaptor.getValue().startsWith("https://portal.test/activate?token="));
        assertEquals("it", localeCaptor.getValue());
    }

    @Test
    void register_ShouldFailIfEmailExists() {
        RegistrationRequest request = new RegistrationRequest();
        request.setEmail("existing@example.com");

        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(new User()));

        ResponseEntity<RegistrationResponse> response = authController.register(request);

        assertEquals(400, response.getStatusCodeValue());
        assertFalse(response.getBody().isSuccess());
    }
}
