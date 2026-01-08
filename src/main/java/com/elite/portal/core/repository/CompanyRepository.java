package com.elite.portal.core.repository;

import com.elite.portal.core.entity.Company;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository per l'entita' Company.
 */
@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    /**
     * Trova una company per ragione sociale.
     *
     * @param name ragione sociale
     * @return Optional con la company se trovata
     */
    Optional<Company> findByName(String name);

    /**
     * Trova una company per partita IVA.
     *
     * @param vatNumber partita IVA
     * @return Optional con la company se trovata
     */
    Optional<Company> findByVatNumber(String vatNumber);
}
