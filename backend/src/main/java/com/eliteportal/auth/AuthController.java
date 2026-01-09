package com.eliteportal.auth;

import com.eliteportal.config.EmailProperties;
import com.eliteportal.email.EmailService;
import com.eliteportal.user.User;
import com.eliteportal.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final EmailProperties emailProperties;

    @Autowired
    public AuthController(UserRepository userRepository,
                          EmailService emailService,
                          EmailProperties emailProperties) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.emailProperties = emailProperties;
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponse> register(@RequestBody RegistrationRequest request) {
        Optional<User> existing = userRepository.findByEmail(request.getEmail());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(new RegistrationResponse(false, "Email già registrata"));
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRequestedRole(request.getRequestedRole());
        user.setEnabled(false);

        String token = UUID.randomUUID().toString();
        user.setActivationToken(token);
        user.setActivationTokenExpiry(LocalDateTime.now().plusHours(emailProperties.getActivationValidityHours()));

        userRepository.save(user);

        String activationLink = buildActivationLink(token);
        emailService.sendActivationEmail(user, activationLink, request.getLocale());

        return ResponseEntity.created(URI.create("/api/auth/register"))
                .body(new RegistrationResponse(true, "Registrazione effettuata. Controlla la tua email per attivare l'account."));
    }

    @GetMapping("/activate/{token}")
    public ResponseEntity<RegistrationResponse> activate(@PathVariable("token") String token) {
        Optional<User> optionalUser = userRepository.findByActivationToken(token);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new RegistrationResponse(false, "Token di attivazione non valido"));
        }

        User user = optionalUser.get();
        if (user.getActivationTokenExpiry() != null && user.getActivationTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest()
                    .body(new RegistrationResponse(false, "Token di attivazione scaduto"));
        }

        user.setEnabled(true);
        user.setActivationToken(null);
        user.setActivationTokenExpiry(null);
        userRepository.save(user);

        LOGGER.info("User {} successfully activated", user.getEmail());
        return ResponseEntity.ok(new RegistrationResponse(true, "Account attivato con successo"));
    }

    private String buildActivationLink(String token) {
        String baseUrl = emailProperties.getPortalBaseUrl();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl + "/activate?token=" + token;
    }
}
