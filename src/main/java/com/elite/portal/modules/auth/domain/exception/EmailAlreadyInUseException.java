package com.elite.portal.modules.auth.domain.exception;

public class EmailAlreadyInUseException extends RuntimeException {

    private final String email;

    public EmailAlreadyInUseException(String email) {
        super("external.registration.email.duplicate");
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
