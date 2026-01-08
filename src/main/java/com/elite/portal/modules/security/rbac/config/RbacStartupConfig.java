package com.elite.portal.modules.security.rbac.config;

import com.elite.portal.modules.security.rbac.service.RbacService;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RbacStartupConfig {

    private final RbacService rbacService;

    public RbacStartupConfig(RbacService rbacService) {
        this.rbacService = rbacService;
    }

    @PostConstruct
    public void initBaseRbac() {
        rbacService.ensureBaseRolesAndPermissions();
    }
}
