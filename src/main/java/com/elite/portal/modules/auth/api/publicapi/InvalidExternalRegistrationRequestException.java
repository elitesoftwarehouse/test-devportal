package com.elite.portal.modules.auth.api.publicapi;

public class InvalidExternalRegistrationRequestException extends RuntimeException {

    public InvalidExternalRegistrationRequestException(String message) {
        super(message);
    }
}
