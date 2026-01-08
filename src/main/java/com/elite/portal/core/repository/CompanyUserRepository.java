package com.elite.portal.core.repository;

import com.elite.portal.core.entity.CompanyUser;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository per la relazione CompanyUser.
 */
@Repository
public interface CompanyUserRepository extends JpaRepository<CompanyUser, Long> {

    /**
     * Restituisce tutti i collegamenti per una determinata company.
     *
     * @param companyId id company
     * @return lista di relazioni company-utente
     */
    List<CompanyUser> findByCompanyId(Long companyId);

    /**
     * Restituisce tutti i collegamenti per un determinato utente.
     *
     * @param userId id utente
     * @return lista di relazioni company-utente
     */
    List<CompanyUser> findByUserId(Long userId);
}
