package com.elite.portal.modules.user.registration;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository JPA minimale per la gestione dei token di registrazione.
 */
@Repository
public interface RegistrationTokenRepository extends JpaRepository<RegistrationTokenEntity, Long> {

    /**
     * Restituisce un token di registrazione a partire dal suo valore stringa.
     *
     * @param token valore del token
     * @return Optional contenente il token se esiste
     */
    Optional<RegistrationTokenEntity> findByToken(String token);
}
