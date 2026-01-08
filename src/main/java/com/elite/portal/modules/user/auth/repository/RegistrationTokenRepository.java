package com.elite.portal.modules.user.auth.repository;

import com.elite.portal.modules.user.auth.entity.RegistrationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository JPA per la gestione dei token di registrazione.
 */
public interface RegistrationTokenRepository extends JpaRepository<RegistrationToken, Long> {

    Optional<RegistrationToken> findByToken(String token);
}
