package com.elite.portal.modules.security.rbac.service;

import com.elite.portal.modules.security.rbac.entity.Permission;
import com.elite.portal.modules.security.rbac.entity.Role;
import com.elite.portal.modules.security.rbac.model.PermissionKey;
import com.elite.portal.modules.security.rbac.model.RoleCode;
import com.elite.portal.modules.security.rbac.repository.PermissionRepository;
import com.elite.portal.modules.security.rbac.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

public class RbacServiceTest {

    private RoleRepository roleRepository;
    private PermissionRepository permissionRepository;
    private RbacService rbacService;

    @BeforeEach
    void setUp() {
        roleRepository = Mockito.mock(RoleRepository.class);
        permissionRepository = Mockito.mock(PermissionRepository.class);
        rbacService = new RbacService(roleRepository, permissionRepository);
    }

    @Test
    void hasPermissionReturnsTrueWhenRoleHasPermission() {
        Permission viewQueue = new Permission();
        viewQueue.setId(1L);
        viewQueue.setKey(PermissionKey.VIEW_ACCREDITATION_QUEUE.getKey());

        Role sysAdmin = new Role();
        sysAdmin.setId(1L);
        sysAdmin.setCode(RoleCode.SYS_ADMIN.getCode());
        sysAdmin.setName("System Administrator");
        sysAdmin.setPermissions(Set.of(viewQueue));

        when(roleRepository.findByCode(RoleCode.SYS_ADMIN.getCode())).thenReturn(Optional.of(sysAdmin));

        boolean result = rbacService.hasPermission(Set.of(RoleCode.SYS_ADMIN.getCode()), PermissionKey.VIEW_ACCREDITATION_QUEUE);

        assertTrue(result);
    }

    @Test
    void hasPermissionReturnsFalseWhenRoleDoesNotHavePermission() {
        Permission manageUsers = new Permission();
        manageUsers.setId(2L);
        manageUsers.setKey(PermissionKey.MANAGE_USERS_BASE.getKey());

        Role itOperator = new Role();
        itOperator.setId(2L);
        itOperator.setCode(RoleCode.IT_OPERATOR.getCode());
        itOperator.setName("IT Operator");
        itOperator.setPermissions(Set.of(manageUsers));

        when(roleRepository.findByCode(RoleCode.IT_OPERATOR.getCode())).thenReturn(Optional.of(itOperator));

        boolean result = rbacService.hasPermission(Set.of(RoleCode.IT_OPERATOR.getCode()), PermissionKey.VIEW_ACCREDITATION_QUEUE);

        assertFalse(result);
    }

    @Test
    void ensureBasePermissionsCreatesAllPermissions() {
        when(permissionRepository.findByKey(anyString())).thenReturn(Optional.empty());
        when(permissionRepository.save(Mockito.any(Permission.class)))
                .thenAnswer(invocation -> {
                    Permission p = invocation.getArgument(0);
                    p.setId(1L);
                    return p;
                });

        var result = rbacService.ensureBasePermissions();

        assertTrue(result.size() >= PermissionKey.values().length);
    }
}
