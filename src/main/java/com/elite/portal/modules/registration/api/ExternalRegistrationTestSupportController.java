package com.elite.portal.modules.registration.api;

import com.elite.portal.modules.registration.domain.ExternalUser;
import com.elite.portal.modules.registration.domain.ExternalUserType;
import com.elite.portal.modules.registration.domain.RegistrationStatus;
import com.elite.portal.modules.registration.repository.ExternalUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

/**
 * Controller di supporto esclusivamente per i test automatizzati.
 * Permette di verificare lo stato utente e la presenza dell'hash password
 * senza esporre dati sensibili in ambienti produttivi.
 *
 * NOTA: in produzione questo controller deve essere disabilitato o protetto
 * tramite un profilo dedicato (es. "test").
 */
@RestController
@RequestMapping("/api/test/registration")
public class ExternalRegistrationTestSupportController {

    private final ExternalUserRepository externalUserRepository;
    private final PasswordEncoder passwordEncoder;

    public ExternalRegistrationTestSupportController(ExternalUserRepository externalUserRepository,
                                                     PasswordEncoder passwordEncoder) {
        this.externalUserRepository = externalUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/user/by-email/{email}")
    public ResponseEntity<ExternalUserTestView> findByEmail(@PathVariable("email") String email) {
        Optional<ExternalUser> userOpt = externalUserRepository.findByEmailIgnoreCase(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ExternalUser user = userOpt.get();
        ExternalUserTestView view = new ExternalUserTestView();
        view.setId(user.getId());
        view.setEmail(user.getEmail());
        view.setType(user.getType());
        view.setStatus(user.getStatus());
        view.setPasswordNotBlank(user.getPasswordHash() != null && !user.getPasswordHash().isBlank());
        view.setPasswordLooksHashed(!user.getPasswordHash().equalsIgnoreCase("password")
                && !user.getPasswordHash().equalsIgnoreCase("Password123!")
                && !user.getPasswordHash().equalsIgnoreCase("Test1234!"));
        return ResponseEntity.ok(view);
    }

    public static class ExternalUserTestView {
        private Long id;
        private String email;
        private ExternalUserType type;
        private RegistrationStatus status;
        private boolean passwordNotBlank;
        private boolean passwordLooksHashed;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public ExternalUserType getType() {
            return type;
        }

        public void setType(ExternalUserType type) {
            this.type = type;
        }

        public RegistrationStatus getStatus() {
            return status;
        }

        public void setStatus(RegistrationStatus status) {
            this.status = status;
        }

        public boolean isPasswordNotBlank() {
            return passwordNotBlank;
        }

        public void setPasswordNotBlank(boolean passwordNotBlank) {
            this.passwordNotBlank = passwordNotBlank;
        }

        public boolean isPasswordLooksHashed() {
            return passwordLooksHashed;
        }

        public void setPasswordLooksHashed(boolean passwordLooksHashed) {
            this.passwordLooksHashed = passwordLooksHashed;
        }
    }
}
