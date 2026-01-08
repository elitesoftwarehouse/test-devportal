package com.elite.portal.core.repository;

import com.elite.portal.core.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository JPA per l'entità User.
 */
public interface UserRepository extends JpaRepository<User, Long> {
}
