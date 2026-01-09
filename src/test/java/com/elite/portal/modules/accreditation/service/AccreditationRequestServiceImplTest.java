package com.elite.portal.modules.accreditation.service.impl;

import com.elite.portal.modules.accreditation.dto.AccreditationRequestApproveRequestDto;
import com.elite.portal.modules.accreditation.dto.AccreditationRequestDetailDto;
import com.elite.portal.modules.accreditation.dto.AccreditationRequestRejectRequestDto;
import com.elite.portal.modules.accreditation.model.AccreditationRequest;
import com.elite.portal.modules.accreditation.model.AccreditationRequestStatus;
import com.elite.portal.modules.accreditation.repository.AccreditationRequestRepository;
import com.elite.portal.modules.user.model.User;
import com.elite.portal.modules.user.service.UserService;
import com.elite.portal.shared.audit.AuditLogger;
import com.elite.portal.shared.error.BusinessException;
import com.elite.portal.shared.error.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

public class AccreditationRequestServiceImplTest {

    private AccreditationRequestRepository repository;
    private UserService userService;
    private AuditLogger auditLogger;
    private AccreditationRequestServiceImpl service;

    @BeforeEach
    public void setUp() {
        repository = Mockito.mock(AccreditationRequestRepository.class);
        userService = Mockito.mock(UserService.class);
        auditLogger = Mockito.mock(AuditLogger.class);
        service = new AccreditationRequestServiceImpl(repository, userService, auditLogger);
    }

    @Test
    public void testApprovePendingRequest() {
        AccreditationRequest request = buildPendingRequest();
        Mockito.when(repository.findById(1L)).thenReturn(Optional.of(request));

        User user = new User();
        user.setId(99L);
        Mockito.when(userService.enableOrCreateExternalUser(eq(100L), eq("user@example.com"), eq("User Test"), eq("EXTERNAL_USER"))).thenReturn(user);

        AccreditationRequestApproveRequestDto approveDto = new AccreditationRequestApproveRequestDto();
        approveDto.setOverrideRoleCode(null);

        AccreditationRequestDetailDto result = service.approve(1L, approveDto, 10L);

        ArgumentCaptor<AccreditationRequest> captor = ArgumentCaptor.forClass(AccreditationRequest.class);
        Mockito.verify(repository).save(captor.capture());
        AccreditationRequest saved = captor.getValue();

        assertEquals(AccreditationRequestStatus.APPROVED, saved.getStatus());
        assertEquals(10L, saved.getApproverId());
        assertEquals("APPROVED", result.getStatus());
    }

    @Test
    public void testRejectPendingRequest() {
        AccreditationRequest request = buildPendingRequest();
        Mockito.when(repository.findById(1L)).thenReturn(Optional.of(request));

        AccreditationRequestRejectRequestDto rejectDto = new AccreditationRequestRejectRequestDto();
        rejectDto.setNoteRifiuto("Dati incompleti");

        AccreditationRequestDetailDto result = service.reject(1L, rejectDto, 11L);

        ArgumentCaptor<AccreditationRequest> captor = ArgumentCaptor.forClass(AccreditationRequest.class);
        Mockito.verify(repository).save(captor.capture());
        AccreditationRequest saved = captor.getValue();

        assertEquals(AccreditationRequestStatus.REJECTED, saved.getStatus());
        assertEquals(11L, saved.getApproverId());
        assertEquals("REJECTED", result.getStatus());
        assertEquals("Dati incompleti", result.getRejectionNotes());
    }

    @Test
    public void testApproveAlreadyProcessedThrows() {
        AccreditationRequest request = buildPendingRequest();
        request.setStatus(AccreditationRequestStatus.APPROVED);
        Mockito.when(repository.findById(1L)).thenReturn(Optional.of(request));

        BusinessException ex = assertThrows(BusinessException.class, () -> service.approve(1L, new AccreditationRequestApproveRequestDto(), 10L));
        assertEquals(ErrorCode.INVALID_STATE, ex.getErrorCode());
    }

    private AccreditationRequest buildPendingRequest() {
        AccreditationRequest request = new AccreditationRequest();
        request.setId(1L);
        request.setRequesterUserId(100L);
        request.setRequesterEmail("user@example.com");
        request.setRequesterFullName("User Test");
        request.setRequestedRoleCode("EXTERNAL_USER");
        request.setStatus(AccreditationRequestStatus.PENDING);
        request.setCreatedAt(OffsetDateTime.now());
        return request;
    }
}
