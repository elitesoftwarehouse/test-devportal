package com.elite.portal.core.repository;

import com.elite.portal.core.entity.ProfessionalTaxData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfessionalTaxDataRepository extends JpaRepository<ProfessionalTaxData, Long> {
}
