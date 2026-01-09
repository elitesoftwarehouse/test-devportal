package com.elite.portal.modules.auth.domain.exception;

import java.util.Locale;

public class InvalidPasswordPolicyException extends RuntimeException {

    private final Locale locale;

    public InvalidPasswordPolicyException(Locale locale) {
        super("external.registration.password.policy_not_met");
        this.locale = locale;
    }

    public Locale getLocale() {
        return locale;
    }
}
