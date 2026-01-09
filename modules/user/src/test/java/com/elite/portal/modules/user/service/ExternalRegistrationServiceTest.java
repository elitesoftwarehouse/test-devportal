package com.elite.portal.modules.user.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.elite.portal.core.entity.Role;
import com.elite.portal.core.entity.RoleType;
import com.elite.portal.core.entity.User;
import com.elite.portal.core.entity.UserStatus;
import com.elite.portal.core.repository.RoleRepository;
import com.elite.portal.core.repository.UserRepository;
import com.elite.portal.modules.user.dto.ExternalUserRegistrationRequest;

public class ExternalRegistrationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailSenderService emailSenderService;

    @InjectMocks
    private ExternalRegistrationService externalRegistrationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Imposta valori di default per i campi @Value tramite reflection se necessario
    }

    @Test
    void registerExternalUser_success_owner() {
        ExternalUserRegistrationRequest req = new ExternalUserRegistrationRequest();
        req.setFirstName("Mario");
        req.setLastName("Rossi");
        req.setEmail("mario.rossi@example.com");
        req.setPassword("Password123!");
        req.setRole(RoleType.EXTERNAL_OWNER);
        req.setPrivacyAccepted(true);
        req.setTermsAccepted(true);

        when(userRepository.existsByEmail(eq("mario.rossi@example.com"))).thenReturn(false);

        Role role = new Role(RoleType.EXTERNAL_OWNER);
        when(roleRepository.findByName(RoleType.EXTERNAL_OWNER)).thenReturn(Optional.of(role));

        when(passwordEncoder.encode(eq("Password123!"))).thenReturn("encoded");

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(1L);
            return u;
        });

        User user = externalRegistrationService.registerExternalUser(req);

        assertNotNull(user.getId());
        assertEquals("mario.rossi@example.com", user.getEmail());
        assertEquals(UserStatus.PENDING_ACTIVATION, user.getStatus());
        assertTrue(user.getActivationToken() != null && !user.getActivationToken().isEmpty());
        assertNotNull(user.getActivationTokenExpiration());
        assertTrue(user.getActivationTokenExpiration().isAfter(Instant.now()));

        assertTrue(user.getRoles().stream().anyMatch(r -> r.getName() == RoleType.EXTERNAL_OWNER));

        verify(emailSenderService).sendActivationEmail(eq("mario.rossi@example.com"), any(String.class));
    }
}
