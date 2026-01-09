package com.elite.portal.modules.security.rbac.model;

public enum PermissionKey {

    VIEW_ACCREDITATION_QUEUE("VIEW_ACCREDITATION_QUEUE"),
    APPROVE_ACCREDITATION_REQUEST("APPROVE_ACCREDITATION_REQUEST"),
    REJECT_ACCREDITATION_REQUEST("REJECT_ACCREDITATION_REQUEST"),
    MANAGE_USERS_BASE("MANAGE_USERS_BASE");

    private final String key;

    PermissionKey(String key) {
        this.key = key;
    }

    public String getKey() {
        return key;
    }
}
