package com.elite.portal.modules.accreditation.service;

import com.elite.portal.modules.accreditation.dto.AccreditationRequestApproveRequestDto;
import com.elite.portal.modules.accreditation.dto.AccreditationRequestDetailDto;
import com.elite.portal.modules.accreditation.dto.AccreditationRequestListItemDto;
import com.elite.portal.modules.accreditation.dto.AccreditationRequestRejectRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AccreditationRequestService {

    Page<AccreditationRequestListItemDto> findByStatus(String status, Pageable pageable, Long currentUserId);

    AccreditationRequestDetailDto getDetail(Long id, Long currentUserId);

    AccreditationRequestDetailDto approve(Long id, AccreditationRequestApproveRequestDto approveRequestDto, Long currentUserId);

    AccreditationRequestDetailDto reject(Long id, AccreditationRequestRejectRequestDto rejectRequestDto, Long currentUserId);
}
