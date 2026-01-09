package com.elite.portal.modules.user.service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elite.portal.core.entity.Role;
import com.elite.portal.core.entity.RoleType;
import com.elite.portal.core.entity.User;
import com.elite.portal.core.entity.UserStatus;
import com.elite.portal.core.repository.RoleRepository;
import com.elite.portal.core.repository.UserRepository;
import com.elite.portal.modules.user.dto.ExternalUserRegistrationRequest;

@Service
public class ExternalRegistrationService {

    private static final int ACTIVATION_TOKEN_NUM_BYTES = 32; // ~43 caratteri Base64

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailSenderService emailSenderService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.registration.activation-token-hours:24}")
    private long activationTokenHours;

    @Value("${app.registration.activation-base-url:http://localhost:8080}")
    private String activationBaseUrl;

    @Autowired
    public ExternalRegistrationService(
        UserRepository userRepository,
        RoleRepository roleRepository,
        PasswordEncoder passwordEncoder,
        EmailSenderService emailSenderService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailSenderService = emailSenderService;
    }

    @Transactional
    public User registerExternalUser(ExternalUserRegistrationRequest request) {
        if (!request.isPrivacyAccepted() || !request.isTermsAccepted()) {
            throw new IllegalArgumentException("Devi accettare privacy e termini di servizio.");
        }

        if (request.getRole() == null ||
            (request.getRole() != RoleType.EXTERNAL_OWNER && request.getRole() != RoleType.EXTERNAL_COLLABORATOR)) {
            throw new IllegalArgumentException("Ruolo non valido. Usa EXTERNAL_OWNER o EXTERNAL_COLLABORATOR.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Esiste già un account registrato con questa email.");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.PENDING_ACTIVATION);
        user.setEmailVerified(false);

        String token = generateActivationToken();
        Instant expiration = Instant.now().plus(Duration.ofHours(activationTokenHours));
        user.setActivationToken(token);
        user.setActivationTokenExpiration(expiration);

        Optional<Role> roleOpt = roleRepository.findByName(request.getRole());
        Role role = roleOpt.orElseThrow(() -> new IllegalStateException("Ruolo non configurato: " + request.getRole()));
        user.getRoles().add(role);

        User saved = userRepository.save(user);

        String activationLink = activationBaseUrl + "/user/activate?token=" + token;
        emailSenderService.sendActivationEmail(saved.getEmail(), activationLink);

        return saved;
    }

    @Transactional
    public User activateUser(String token) {
        if (token == null || token.isEmpty()) {
            throw new IllegalArgumentException("Token di attivazione mancante.");
        }

        User user = userRepository.findByActivationToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Token di attivazione non valido."));

        if (user.getActivationTokenExpiration() == null || Instant.now().isAfter(user.getActivationTokenExpiration())) {
            throw new IllegalStateException("Il token di attivazione è scaduto.");
        }

        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        user.setActivationToken(null);
        user.setActivationTokenExpiration(null);

        return userRepository.save(user);
    }

    private String generateActivationToken() {
        byte[] randomBytes = new byte[ACTIVATION_TOKEN_NUM_BYTES];
        secureRandom.nextBytes(randomBytes);
        // URL-safe senza padding
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
