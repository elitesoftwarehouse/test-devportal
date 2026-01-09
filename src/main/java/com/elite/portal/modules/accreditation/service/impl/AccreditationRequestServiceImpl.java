package com.elite.portal.modules.accreditation.service.impl;

import com.elite.portal.modules.accreditation.dto.AccreditationRequestApproveRequestDto;
import com.elite.portal.modules.accreditation.dto.AccreditationRequestDetailDto;
import com.elite.portal.modules.accreditation.dto.AccreditationRequestListItemDto;
import com.elite.portal.modules.accreditation.dto.AccreditationRequestRejectRequestDto;
import com.elite.portal.modules.accreditation.model.AccreditationRequest;
import com.elite.portal.modules.accreditation.model.AccreditationRequestStatus;
import com.elite.portal.modules.accreditation.repository.AccreditationRequestRepository;
import com.elite.portal.modules.accreditation.service.AccreditationRequestService;
import com.elite.portal.modules.user.model.User;
import com.elite.portal.modules.user.service.UserService;
import com.elite.portal.shared.audit.AuditLogger;
import com.elite.portal.shared.error.BusinessException;
import com.elite.portal.shared.error.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AccreditationRequestServiceImpl implements AccreditationRequestService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AccreditationRequestServiceImpl.class);

    private final AccreditationRequestRepository accreditationRequestRepository;
    private final UserService userService;
    private final AuditLogger auditLogger;

    public AccreditationRequestServiceImpl(AccreditationRequestRepository accreditationRequestRepository,
                                           UserService userService,
                                           AuditLogger auditLogger) {
        this.accreditationRequestRepository = accreditationRequestRepository;
        this.userService = userService;
        this.auditLogger = auditLogger;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AccreditationRequestListItemDto> findByStatus(String status, Pageable pageable, Long currentUserId) {
        Page<AccreditationRequest> page;
        if (status == null || status.isEmpty()) {
            page = accreditationRequestRepository.findAll(pageable);
        } else {
            AccreditationRequestStatus parsedStatus;
            try {
                parsedStatus = AccreditationRequestStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR, "Invalid status value: " + status);
            }
            page = accreditationRequestRepository.findByStatus(parsedStatus, pageable);
        }
        return new PageImpl<>(
                page.getContent()
                        .stream()
                        .map(this::toListItemDto)
                        .collect(Collectors.toList()),
                pageable,
                page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public AccreditationRequestDetailDto getDetail(Long id, Long currentUserId) {
        AccreditationRequest request = getExistingRequest(id);
        return toDetailDto(request);
    }

    @Override
    @Transactional
    public AccreditationRequestDetailDto approve(Long id, AccreditationRequestApproveRequestDto approveRequestDto, Long currentUserId) {
        AccreditationRequest request = getExistingRequest(id);
        if (!AccreditationRequestStatus.PENDING.equals(request.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATE, "Request has already been processed");
        }

        String roleToAssign = resolveRoleToAssign(request, approveRequestDto);

        User requester = userService.enableOrCreateExternalUser(request.getRequesterUserId(),
                request.getRequesterEmail(),
                request.getRequesterFullName(),
                roleToAssign);

        request.setStatus(AccreditationRequestStatus.APPROVED);
        request.setApproverId(currentUserId);
        request.setDecisionDate(OffsetDateTime.now());
        request.setUpdatedAt(OffsetDateTime.now());
        request.setRejectionNotes(null);

        accreditationRequestRepository.save(request);

        auditLogger.log("ACCREDITATION_REQUEST_APPROVED", currentUserId,
                "Accreditation request %d approved for user %d with role %s".formatted(request.getId(), requester.getId(), roleToAssign));

        LOGGER.info("Accreditation request {} approved by user {} with role {}", request.getId(), currentUserId, roleToAssign);

        return toDetailDto(request);
    }

    @Override
    @Transactional
    public AccreditationRequestDetailDto reject(Long id, AccreditationRequestRejectRequestDto rejectRequestDto, Long currentUserId) {
        AccreditationRequest request = getExistingRequest(id);
        if (!AccreditationRequestStatus.PENDING.equals(request.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATE, "Request has already been processed");
        }

        request.setStatus(AccreditationRequestStatus.REJECTED);
        request.setApproverId(currentUserId);
        request.setDecisionDate(OffsetDateTime.now());
        request.setUpdatedAt(OffsetDateTime.now());
        request.setRejectionNotes(rejectRequestDto.getNoteRifiuto());

        accreditationRequestRepository.save(request);

        auditLogger.log("ACCREDITATION_REQUEST_REJECTED", currentUserId,
                "Accreditation request %d rejected with notes: %s".formatted(request.getId(), rejectRequestDto.getNoteRifiuto()));

        LOGGER.info("Accreditation request {} rejected by user {}", request.getId(), currentUserId);

        return toDetailDto(request);
    }

    private AccreditationRequest getExistingRequest(Long id) {
        Optional<AccreditationRequest> optional = accreditationRequestRepository.findById(id);
        if (optional.isEmpty()) {
            throw new BusinessException(ErrorCode.NOT_FOUND, "Accreditation request not found");
        }
        return optional.get();
    }

    private AccreditationRequestListItemDto toListItemDto(AccreditationRequest entity) {
        return new AccreditationRequestListItemDto(
                entity.getId(),
                entity.getRequesterEmail(),
                entity.getRequesterFullName(),
                entity.getStatus().name(),
                entity.getRequestedRoleCode(),
                entity.getCreatedAt()
        );
    }

    private AccreditationRequestDetailDto toDetailDto(AccreditationRequest entity) {
        AccreditationRequestDetailDto dto = new AccreditationRequestDetailDto();
        dto.setId(entity.getId());
        dto.setRequesterEmail(entity.getRequesterEmail());
        dto.setRequesterFullName(entity.getRequesterFullName());
        dto.setStatus(entity.getStatus().name());
        dto.setRequestedRoleCode(entity.getRequestedRoleCode());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setApproverId(entity.getApproverId());
        dto.setDecisionDate(entity.getDecisionDate());
        dto.setRejectionNotes(entity.getRejectionNotes());
        return dto;
    }

    private String resolveRoleToAssign(AccreditationRequest request, AccreditationRequestApproveRequestDto approveRequestDto) {
        if (approveRequestDto != null && approveRequestDto.getOverrideRoleCode() != null && !approveRequestDto.getOverrideRoleCode().isBlank()) {
            return approveRequestDto.getOverrideRoleCode();
        }
        return request.getRequestedRoleCode();
    }
}
