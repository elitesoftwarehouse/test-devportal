package com.elite.portal.modules.accreditamento.repository;

import com.elite.portal.modules.accreditamento.model.AccreditamentoUtenteEsterno;
import com.elite.portal.modules.accreditamento.model.AccreditamentoUtenteEsternoStato;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository per la gestione delle richieste di accreditamento di utenti esterni.
 *
 * Espone metodi utili per le ricerche principali richieste dalle specifiche:
 * - ricerca per stato
 * - ricerca per email (eventualmente filtrata per portale)
 */
@Repository
public interface AccreditamentoUtenteEsternoRepository extends JpaRepository<AccreditamentoUtenteEsterno, Long> {

    List<AccreditamentoUtenteEsterno> findByStato(AccreditamentoUtenteEsternoStato stato);

    List<AccreditamentoUtenteEsterno> findByEmailIgnoreCase(String email);

    List<AccreditamentoUtenteEsterno> findByEmailIgnoreCaseAndPortaleCodice(String email, String portaleCodice);

    Optional<AccreditamentoUtenteEsterno> findFirstByEmailIgnoreCaseAndPortaleCodiceOrderByDataRichiestaDesc(String email, String portaleCodice);
}
