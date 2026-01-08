package com.elite.portal.modules.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.elite.portal.modules.user.entity.ExternalCompany;

/**
 * Repository JPA per la gestione delle aziende esterne.
 */
@Repository
public interface ExternalCompanyRepository extends JpaRepository<ExternalCompany, Long> {

    /**
     * Ricerca un'azienda esterna per partita IVA.
     *
     * @param partitaIva partita IVA dell'azienda
     * @return Optional contenente l'azienda se presente
     */
    Optional<ExternalCompany> findByPartitaIva(String partitaIva);

}
