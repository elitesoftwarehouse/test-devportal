package com.elite.portal.modules.security.repository;

import com.elite.portal.modules.security.domain.Role;
import com.elite.portal.modules.security.domain.RoleCode;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository per la gestione dei ruoli applicativi.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByCode(RoleCode code);
}
