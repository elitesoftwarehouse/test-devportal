package com.elite.portal.modules.accreditamento.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.elite.portal.modules.accreditamento.model.AccreditationStatus;
import com.elite.portal.modules.accreditamento.model.RequestAccr;
import com.elite.portal.modules.accreditamento.repository.RequestAccrRepository;
import com.elite.portal.modules.security.model.RoleType;
import com.elite.portal.modules.security.model.UserAccount;
import com.elite.portal.modules.security.repository.UserAccountRepository;

@ExtendWith(MockitoExtension.class)
public class AccreditationServiceTest {

    @Mock
    private RequestAccrRepository requestAccrRepository;

    @Mock
    private UserAccountRepository userAccountRepository;

    private Clock fixedClock;

    @InjectMocks
    private AccreditationService accreditationService;

    @BeforeEach
    public void setup() {
        Instant instant = Instant.parse("2024-01-01T10:15:30.00Z");
        fixedClock = Clock.fixed(instant, ZoneId.of("UTC"));
        accreditationService = new AccreditationService(requestAccrRepository, userAccountRepository, fixedClock);
    }

    @Test
    public void createRequest_shouldCreatePendingRequestWithCreationDate() {
        String email = "test@example.com";
        RequestAccr saved = new RequestAccr();
        saved.setId(1L);
        saved.setExternalEmail(email);
        saved.setStatus(AccreditationStatus.PENDING);
        saved.setCreationDate(LocalDateTime.ofInstant(fixedClock.instant(), fixedClock.getZone()));

        given(requestAccrRepository.save(any(RequestAccr.class))).willReturn(saved);

        RequestAccr result = accreditationService.createRequest(email);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(email, result.getExternalEmail());
        assertEquals(AccreditationStatus.PENDING, result.getStatus());
        assertNotNull(result.getCreationDate());
    }

    @Test
    public void approveRequest_shouldTransitionFromPendingToApprovedAndCreateExternalUser() {
        Long requestId = 1L;
        Long approverId = 99L;
        RequestAccr existing = new RequestAccr();
        existing.setId(requestId);
        existing.setExternalEmail("ext@example.com");
        existing.setStatus(AccreditationStatus.PENDING);
        existing.setCreationDate(LocalDateTime.ofInstant(fixedClock.instant(), fixedClock.getZone()));

        given(requestAccrRepository.findById(requestId)).willReturn(Optional.of(existing));

        UserAccount newUser = new UserAccount();
        newUser.setId(10L);
        newUser.setUsername("ext@example.com");
        newUser.setEnabled(true);
        newUser.addRole(RoleType.EXTERNAL_USER);

        given(userAccountRepository.findByUsername("ext@example.com")).willReturn(Optional.empty());
        given(userAccountRepository.save(any(UserAccount.class))).willReturn(newUser);

        RequestAccr saved = new RequestAccr();
        saved.setId(requestId);
        saved.setExternalEmail("ext@example.com");
        saved.setStatus(AccreditationStatus.APPROVED);
        saved.setCreationDate(existing.getCreationDate());
        saved.setDecisionDate(LocalDateTime.ofInstant(fixedClock.instant(), fixedClock.getZone()));
        saved.setApproverId(approverId);
        saved.setExternalUserId(10L);

        given(requestAccrRepository.save(any(RequestAccr.class))).willReturn(saved);

        RequestAccr result = accreditationService.approveRequest(requestId, approverId);

        assertEquals(AccreditationStatus.APPROVED, result.getStatus());
        assertNotNull(result.getDecisionDate());
        assertEquals(approverId, result.getApproverId());
        assertNull(result.getRejectNote());
        assertEquals(10L, result.getExternalUserId());

        verify(userAccountRepository).save(any(UserAccount.class));
        verify(requestAccrRepository).save(any(RequestAccr.class));
    }

    @Test
    public void approveRequest_shouldFailIfNotPending() {
        Long requestId = 2L;
        RequestAccr existing = new RequestAccr();
        existing.setId(requestId);
        existing.setStatus(AccreditationStatus.APPROVED);

        given(requestAccrRepository.findById(eq(requestId))).willReturn(Optional.of(existing));

        assertThrows(IllegalStateException.class, () -> accreditationService.approveRequest(requestId, 1L));
    }

    @Test
    public void rejectRequest_shouldTransitionFromPendingToRejectedWithNote() {
        Long requestId = 3L;
        Long approverId = 77L;
        String note = "Dati incompleti";

        RequestAccr existing = new RequestAccr();
        existing.setId(requestId);
        existing.setExternalEmail("rejected@example.com");
        existing.setStatus(AccreditationStatus.PENDING);
        existing.setCreationDate(LocalDateTime.ofInstant(fixedClock.instant(), fixedClock.getZone()));

        given(requestAccrRepository.findById(requestId)).willReturn(Optional.of(existing));

        RequestAccr saved = new RequestAccr();
        saved.setId(requestId);
        saved.setExternalEmail("rejected@example.com");
        saved.setStatus(AccreditationStatus.REJECTED);
        saved.setCreationDate(existing.getCreationDate());
        saved.setDecisionDate(LocalDateTime.ofInstant(fixedClock.instant(), fixedClock.getZone()));
        saved.setApproverId(approverId);
        saved.setRejectNote(note);

        given(requestAccrRepository.save(any(RequestAccr.class))).willReturn(saved);

        RequestAccr result = accreditationService.rejectRequest(requestId, approverId, note);

        assertEquals(AccreditationStatus.REJECTED, result.getStatus());
        assertNotNull(result.getDecisionDate());
        assertEquals(approverId, result.getApproverId());
        assertEquals(note, result.getRejectNote());
    }

    @Test
    public void rejectRequest_shouldFailWhenNoteMissing() {
        Long requestId = 4L;
        assertThrows(IllegalArgumentException.class, () -> accreditationService.rejectRequest(requestId, 1L, " "));
    }

    @Test
    public void rejectRequest_shouldFailIfNotPending() {
        Long requestId = 5L;
        RequestAccr existing = new RequestAccr();
        existing.setId(requestId);
        existing.setStatus(AccreditationStatus.APPROVED);

        given(requestAccrRepository.findById(requestId)).willReturn(Optional.of(existing));

        assertThrows(IllegalStateException.class, () -> accreditationService.rejectRequest(requestId, 1L, "nota"));
    }
}
