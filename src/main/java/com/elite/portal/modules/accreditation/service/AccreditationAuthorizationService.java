package com.elite.portal.modules.accreditation.service;

import com.elite.portal.modules.security.rbac.model.PermissionKey;
import com.elite.portal.modules.security.rbac.service.RbacService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AccreditationAuthorizationService {

    private final RbacService rbacService;

    public AccreditationAuthorizationService(RbacService rbacService) {
        this.rbacService = rbacService;
    }

    public void checkCanViewQueue(Authentication authentication) {
        checkPermission(authentication, PermissionKey.VIEW_ACCREDITATION_QUEUE);
    }

    public void checkCanApproveRequest(Authentication authentication) {
        checkPermission(authentication, PermissionKey.APPROVE_ACCREDITATION_REQUEST);
    }

    public void checkCanRejectRequest(Authentication authentication) {
        checkPermission(authentication, PermissionKey.REJECT_ACCREDITATION_REQUEST);
    }

    public void checkCanManageUsers(Authentication authentication) {
        checkPermission(authentication, PermissionKey.MANAGE_USERS_BASE);
    }

    private void checkPermission(Authentication authentication, PermissionKey permissionKey) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Utente non autenticato");
        }
        Set<String> roleCodes = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
        boolean allowed = rbacService.hasPermission(roleCodes, permissionKey);
        if (!allowed) {
            throw new AccessDeniedException("Accesso negato: permesso richiesto " + permissionKey.getKey());
        }
    }
}
