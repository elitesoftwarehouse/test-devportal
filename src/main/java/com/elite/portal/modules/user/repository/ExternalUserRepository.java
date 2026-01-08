package com.elite.portal.modules.user.repository;

import com.elite.portal.modules.user.model.ExternalUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExternalUserRepository extends JpaRepository<ExternalUser, Long> {

    @Query("SELECT u FROM ExternalUser u WHERE u.email = :email AND u.active = true AND u.type = 'STANDARD_EXTERNAL'")
    Optional<ExternalUser> findByEmailAndActiveTrueAndTypeStandardExternal(@Param("email") String email);

}
