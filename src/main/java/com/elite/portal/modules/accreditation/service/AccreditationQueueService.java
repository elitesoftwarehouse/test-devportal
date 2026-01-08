package com.elite.portal.modules.accreditation.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AccreditationQueueService {

    private final AccreditationAuthorizationService authorizationService;

    public AccreditationQueueService(AccreditationAuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    public List<String> getPendingRequests(Authentication authentication) {
        authorizationService.checkCanViewQueue(authentication);
        return Collections.emptyList();
    }

    public void approveRequest(Authentication authentication, Long requestId) {
        authorizationService.checkCanApproveRequest(authentication);
    }

    public void rejectRequest(Authentication authentication, Long requestId) {
        authorizationService.checkCanRejectRequest(authentication);
    }
}
