package com.elite.portal.modules.user.registration;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository JPA minimale per gli utenti esterni.
 */
@Repository
public interface ExternalUserRepository extends JpaRepository<ExternalUserEntity, Long> {

    /**
     * Restituisce un utente esterno a partire dall'email.
     *
     * @param email email dell'utente
     * @return Optional contenente l'utente se presente
     */
    Optional<ExternalUserEntity> findByEmail(String email);
}
