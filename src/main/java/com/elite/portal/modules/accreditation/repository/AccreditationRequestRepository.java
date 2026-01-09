package com.elite.portal.modules.accreditation.repository;

import com.elite.portal.modules.accreditation.model.AccreditationRequest;
import com.elite.portal.modules.accreditation.model.AccreditationRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccreditationRequestRepository extends JpaRepository<AccreditationRequest, Long> {

    Page<AccreditationRequest> findByStatus(AccreditationRequestStatus status, Pageable pageable);
}
