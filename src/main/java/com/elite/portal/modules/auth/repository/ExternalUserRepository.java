package com.elite.portal.modules.auth.repository;

import com.elite.portal.modules.auth.model.ExternalUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExternalUserRepository extends JpaRepository<ExternalUser, Long> {

    Optional<ExternalUser> findByEmail(String email);

    Optional<ExternalUser> findByEmailVerificationToken(String token);
}
