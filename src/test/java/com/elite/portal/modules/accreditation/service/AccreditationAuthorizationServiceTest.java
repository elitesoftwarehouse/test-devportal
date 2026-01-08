package com.elite.portal.modules.accreditation.service;

import com.elite.portal.modules.security.rbac.model.PermissionKey;
import com.elite.portal.modules.security.rbac.service.RbacService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

public class AccreditationAuthorizationServiceTest {

    private RbacService rbacService;
    private AccreditationAuthorizationService authorizationService;

    @BeforeEach
    void setUp() {
        rbacService = Mockito.mock(RbacService.class);
        authorizationService = new AccreditationAuthorizationService(rbacService);
    }

    @Test
    void checkCanViewQueueAllowsWhenPermissionGranted() {
        Authentication authentication = Mockito.mock(Authentication.class);
        GrantedAuthority authority = () -> "SYS_ADMIN";
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getAuthorities()).thenReturn(List.of(authority));
        when(rbacService.hasPermission(Set.of("SYS_ADMIN"), PermissionKey.VIEW_ACCREDITATION_QUEUE)).thenReturn(true);

        assertDoesNotThrow(() -> authorizationService.checkCanViewQueue(authentication));
    }

    @Test
    void checkCanViewQueueDeniesWhenPermissionMissing() {
        Authentication authentication = Mockito.mock(Authentication.class);
        GrantedAuthority authority = () -> "IT_OPERATOR";
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getAuthorities()).thenReturn(List.of(authority));
        when(rbacService.hasPermission(Set.of("IT_OPERATOR"), PermissionKey.VIEW_ACCREDITATION_QUEUE)).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> authorizationService.checkCanViewQueue(authentication));
    }
}
