package com.elite.portal.modules.user.registration;

import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Servizio minimale utilizzato nei test per validare il comportamento
 * di login degli utenti esterni dopo la registrazione.
 */
@Service
public class LoginService {

    private final ExternalUserRepository externalUserRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginService(ExternalUserRepository externalUserRepository,
                        PasswordEncoder passwordEncoder) {
        this.externalUserRepository = externalUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Esegue un controllo di login minimale per gli utenti esterni.
     *
     * @param email email dell'utente
     * @param rawPassword password in chiaro
     * @return true se il login ha successo, false altrimenti
     */
    public boolean login(String email, String rawPassword) {
        Optional<ExternalUserEntity> optionalUser = externalUserRepository.findByEmail(email);
        if (!optionalUser.isPresent()) {
            return false;
        }

        ExternalUserEntity user = optionalUser.get();
        if (user.getStatus() != ExternalUserStatus.ACTIVE) {
            return false;
        }

        String hash = user.getPasswordHash();
        if (hash == null) {
            return false;
        }

        return passwordEncoder.matches(rawPassword, hash);
    }
}
