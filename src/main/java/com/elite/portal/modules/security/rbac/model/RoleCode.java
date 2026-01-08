package com.elite.portal.modules.security.rbac.model;

public enum RoleCode {

    SYS_ADMIN("SYS_ADMIN"),
    IT_OPERATOR("IT_OPERATOR");

    private final String code;

    RoleCode(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
