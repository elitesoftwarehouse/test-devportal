package com.elite.portal.core.repository;

import com.elite.portal.core.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository per l'entita' User.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Trova un utente per email.
     *
     * @param email indirizzo email
     * @return Optional contenente l'utente se trovato
     */
    Optional<User> findByEmail(String email);

    /**
     * Verifica se esiste un utente con la email specificata.
     *
     * @param email indirizzo email
     * @return true se esiste, false altrimenti
     */
    boolean existsByEmail(String email);

    /**
     * Trova un utente tramite token di verifica email.
     *
     * @param emailVerificationToken token di verifica email
     * @return Optional contenente l'utente se trovato
     */
    Optional<User> findByEmailVerificationToken(String emailVerificationToken);
}
