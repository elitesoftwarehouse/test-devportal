package com.elite.portal.modules.accreditamento.service;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elite.portal.modules.accreditamento.model.AccreditationStatus;
import com.elite.portal.modules.accreditamento.model.RequestAccr;
import com.elite.portal.modules.accreditamento.repository.RequestAccrRepository;
import com.elite.portal.modules.security.model.RoleType;
import com.elite.portal.modules.security.model.UserAccount;
import com.elite.portal.modules.security.repository.UserAccountRepository;

@Service
public class AccreditationService {

    private final RequestAccrRepository requestAccrRepository;
    private final UserAccountRepository userAccountRepository;
    private final Clock clock;

    public AccreditationService(RequestAccrRepository requestAccrRepository,
                                UserAccountRepository userAccountRepository,
                                Clock clock) {
        this.requestAccrRepository = requestAccrRepository;
        this.userAccountRepository = userAccountRepository;
        this.clock = clock;
    }

    @Transactional
    public RequestAccr createRequest(String externalEmail) {
        RequestAccr requestAccr = new RequestAccr();
        requestAccr.setExternalEmail(externalEmail);
        requestAccr.setStatus(AccreditationStatus.PENDING);
        requestAccr.setCreationDate(LocalDateTime.now(clock));
        return requestAccrRepository.save(requestAccr);
    }

    @Transactional(readOnly = true)
    public Optional<RequestAccr> findById(Long id) {
        return requestAccrRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<RequestAccr> findByStatus(AccreditationStatus status) {
        if (status == null) {
            return requestAccrRepository.findAll();
        }
        return requestAccrRepository.findByStatus(status);
    }

    @Transactional
    public RequestAccr approveRequest(Long requestId, Long approverId) {
        RequestAccr requestAccr = requestAccrRepository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("RequestAccr not found: " + requestId));

        if (requestAccr.getStatus() != AccreditationStatus.PENDING) {
            throw new IllegalStateException("RequestAccr not in PENDING status");
        }

        requestAccr.setStatus(AccreditationStatus.APPROVED);
        requestAccr.setDecisionDate(LocalDateTime.now(clock));
        requestAccr.setApproverId(approverId);
        requestAccr.setRejectNote(null);

        UserAccount externalUser = userAccountRepository.findByUsername(requestAccr.getExternalEmail())
            .orElseGet(() -> {
                UserAccount account = new UserAccount();
                account.setUsername(requestAccr.getExternalEmail());
                account.setEnabled(true);
                account.addRole(RoleType.EXTERNAL_USER);
                return userAccountRepository.save(account);
            });

        if (!externalUser.isEnabled()) {
            externalUser.setEnabled(true);
        }
        externalUser.addRole(RoleType.EXTERNAL_USER);
        userAccountRepository.save(externalUser);

        requestAccr.setExternalUserId(externalUser.getId());

        return requestAccrRepository.save(requestAccr);
    }

    @Transactional
    public RequestAccr rejectRequest(Long requestId, Long approverId, String note) {
        if (note == null || note.trim().isEmpty()) {
            throw new IllegalArgumentException("Reject note must not be empty");
        }

        RequestAccr requestAccr = requestAccrRepository.findById(requestId)
            .orElseThrow(() -> new IllegalArgumentException("RequestAccr not found: " + requestId));

        if (requestAccr.getStatus() != AccreditationStatus.PENDING) {
            throw new IllegalStateException("RequestAccr not in PENDING status");
        }

        requestAccr.setStatus(AccreditationStatus.REJECTED);
        requestAccr.setDecisionDate(LocalDateTime.now(clock));
        requestAccr.setApproverId(approverId);
        requestAccr.setRejectNote(note);

        return requestAccrRepository.save(requestAccr);
    }
}
