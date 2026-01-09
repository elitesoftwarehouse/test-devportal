package com.elite.portal.modules.security.rbac.service;

import com.elite.portal.modules.security.rbac.entity.Permission;
import com.elite.portal.modules.security.rbac.entity.Role;
import com.elite.portal.modules.security.rbac.model.PermissionKey;
import com.elite.portal.modules.security.rbac.model.RoleCode;
import com.elite.portal.modules.security.rbac.repository.PermissionRepository;
import com.elite.portal.modules.security.rbac.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class RbacService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public RbacService(RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(Set<String> userRoleCodes, PermissionKey permissionKey) {
        if (userRoleCodes == null || userRoleCodes.isEmpty()) {
            return false;
        }
        for (String roleCode : userRoleCodes) {
            Optional<Role> roleOpt = roleRepository.findByCode(roleCode);
            if (roleOpt.isEmpty()) {
                continue;
            }
            Role role = roleOpt.get();
            for (Permission permission : role.getPermissions()) {
                if (permissionKey.getKey().equals(permission.getKey())) {
                    return true;
                }
            }
        }
        return false;
    }

    @Transactional
    public void ensureBaseRolesAndPermissions() {
        Set<Permission> allPermissions = ensureBasePermissions();
        ensureSysAdminRole(allPermissions);
        ensureItOperatorRole(allPermissions);
    }

    @Transactional
    public Set<Permission> ensureBasePermissions() {
        Set<Permission> permissions = new HashSet<>();
        for (PermissionKey key : EnumSet.allOf(PermissionKey.class)) {
            Permission permission = permissionRepository.findByKey(key.getKey())
                    .orElseGet(() -> {
                        Permission p = new Permission();
                        p.setKey(key.getKey());
                        p.setDescription(key.getKey());
                        return p;
                    });
            permissions.add(permissionRepository.save(permission));
        }
        return permissions;
    }

    @Transactional
    public Role ensureSysAdminRole(Set<Permission> allPermissions) {
        Role role = roleRepository.findByCode(RoleCode.SYS_ADMIN.getCode())
                .orElseGet(Role::new);
        role.setCode(RoleCode.SYS_ADMIN.getCode());
        role.setName("System Administrator");
        role.setPermissions(new HashSet<>(allPermissions));
        return roleRepository.save(role);
    }

    @Transactional
    public Role ensureItOperatorRole(Set<Permission> allPermissions) {
        Role role = roleRepository.findByCode(RoleCode.IT_OPERATOR.getCode())
                .orElseGet(Role::new);
        role.setCode(RoleCode.IT_OPERATOR.getCode());
        role.setName("IT Operator");
        Set<Permission> subset = new HashSet<>();
        for (Permission permission : allPermissions) {
            if (PermissionKey.VIEW_ACCREDITATION_QUEUE.getKey().equals(permission.getKey())
                    || PermissionKey.APPROVE_ACCREDITATION_REQUEST.getKey().equals(permission.getKey())
                    || PermissionKey.REJECT_ACCREDITATION_REQUEST.getKey().equals(permission.getKey())) {
                subset.add(permission);
            }
        }
        role.setPermissions(subset);
        return roleRepository.save(role);
    }
}
