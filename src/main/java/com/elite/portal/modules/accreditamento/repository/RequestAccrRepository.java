package com.elite.portal.modules.accreditamento.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.elite.portal.modules.accreditamento.model.AccreditationStatus;
import com.elite.portal.modules.accreditamento.model.RequestAccr;

@Repository
public interface RequestAccrRepository extends JpaRepository<RequestAccr, Long> {

    List<RequestAccr> findByStatus(AccreditationStatus status);

}
