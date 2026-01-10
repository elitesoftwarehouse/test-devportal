package com.elite.portal.core.repository;

import com.elite.portal.core.entity.ProfessionalProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfessionalProfileRepository extends JpaRepository<ProfessionalProfile, Long> {

    Optional<ProfessionalProfile> findByUserId(Long userId);

    Optional<ProfessionalProfile> findByFiscalCodeIgnoreCase(String fiscalCode);

    Optional<ProfessionalProfile> findByVatNumber(String vatNumber);

    Optional<ProfessionalProfile> findByPrimaryEmailIgnoreCase(String primaryEmail);
}
