package com.elite.portal.modules.security.rbac.repository;

import com.elite.portal.modules.security.rbac.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByKey(String key);
}
