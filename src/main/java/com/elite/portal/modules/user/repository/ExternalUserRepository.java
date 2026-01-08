package com.elite.portal.modules.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.elite.portal.modules.user.entity.ExternalUser;

/**
 * Repository JPA per la gestione degli utenti esterni.
 */
@Repository
public interface ExternalUserRepository extends JpaRepository<ExternalUser, Long> {

    /**
     * Cerca un utente esterno a partire dal token di registrazione iniziale.
     *
     * @param registrationToken token di registrazione
     * @return utente se presente
     */
    Optional<ExternalUser> findByRegistrationToken(String registrationToken);
}
