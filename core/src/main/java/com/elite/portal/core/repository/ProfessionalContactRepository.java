package com.elite.portal.core.repository;

import com.elite.portal.core.entity.ProfessionalContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfessionalContactRepository extends JpaRepository<ProfessionalContact, Long> {
}
