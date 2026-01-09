package com.elite.portal.modules.security.rbac.repository;

import com.elite.portal.modules.security.rbac.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByCode(String code);
}
