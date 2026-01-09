package com.elite.portal.modules.accreditamento.repository;

import com.elite.portal.modules.accreditamento.domain.AccreditamentoRichiesta;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccreditamentoRichiestaRepository extends JpaRepository<AccreditamentoRichiesta, Long> {

    Optional<AccreditamentoRichiesta> findByIdAndUserId(Long id, Long userId);

    Optional<AccreditamentoRichiesta> findByIdAndEmailIgnoreCase(Long id, String email);

    List<AccreditamentoRichiesta> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    List<AccreditamentoRichiesta> findAllByEmailIgnoreCaseOrderByCreatedAtDesc(String email);

}
