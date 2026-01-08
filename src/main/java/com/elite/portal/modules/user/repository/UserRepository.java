package com.elite.portal.modules.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.elite.portal.modules.user.entity.User;

/**
 * Repository per l'entita' User.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Ricerca un utente per username.
     *
     * @param username username univoco
     * @return Optional contenente l'utente se esiste
     */
    Optional<User> findByUsername(String username);

}
