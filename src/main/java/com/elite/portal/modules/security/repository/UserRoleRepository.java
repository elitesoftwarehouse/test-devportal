package com.elite.portal.modules.security.repository;

import com.elite.portal.modules.security.domain.UserRole;
import com.elite.portal.modules.user.domain.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository per la relazione tra utenti e ruoli.
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    List<UserRole> findByUserAndDeletedAtIsNull(User user);
}
