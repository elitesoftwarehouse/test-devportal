package com.elite.portal.modules.auth.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ExternalUserAccountRepository extends JpaRepository<ExternalUserAccount, UUID> {

    Optional<ExternalUserAccount> findByEmailIgnoreCase(String email);
}
