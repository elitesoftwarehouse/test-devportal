package com.elite.portal.modules.security.repository;

import com.elite.portal.modules.security.domain.AccreditationRequest;
import com.elite.portal.modules.security.domain.AccreditationRequestStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository per la coda richieste di accreditamento.
 */
@Repository
public interface AccreditationRequestRepository extends JpaRepository<AccreditationRequest, Long> {

    List<AccreditationRequest> findByStatusAndDeletedAtIsNullOrderByCreatedAtAsc(AccreditationRequestStatus status);
}
