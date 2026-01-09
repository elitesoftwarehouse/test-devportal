package com.elite.portal.modules.user.repository;

import com.elite.portal.modules.user.domain.ExternalUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExternalUserRepository extends JpaRepository<ExternalUser, Long> {

    Optional<ExternalUser> findByEmail(String email);
}
