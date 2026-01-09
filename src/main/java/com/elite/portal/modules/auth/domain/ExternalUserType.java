package com.elite.portal.modules.auth.domain;

public enum ExternalUserType {

    PROFESSIONAL,
    COMPANY;

    public static ExternalUserType fromCode(String code) {
        if (code == null) {
            throw new IllegalArgumentException("external.registration.type.invalid");
        }
        try {
            return ExternalUserType.valueOf(code.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("external.registration.type.invalid", ex);
        }
    }
}
