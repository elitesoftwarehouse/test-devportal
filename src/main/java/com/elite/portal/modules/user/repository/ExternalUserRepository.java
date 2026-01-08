package com.elite.portal.modules.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.elite.portal.modules.user.entity.ExternalUser;

/**
 * Repository JPA per la gestione degli utenti esterni.
 * <p>
 * Espone metodi per la ricerca per email, vincolata a unicità a livello di DB.
 */
@Repository
public interface ExternalUserRepository extends JpaRepository<ExternalUser, Long> {

    /**
     * Restituisce un utente esterno a partire dalla sua email.
     *
     * @param email email dell'utente esterno
     * @return Optional contenente l'utente se presente
     */
    Optional<ExternalUser> findByEmail(String email);

    /**
     * Verifica se esiste già un utente esterno registrato con la stessa email.
     *
     * @param email email da verificare
     * @return true se esiste almeno un utente con tale email
     */
    boolean existsByEmail(String email);

}
