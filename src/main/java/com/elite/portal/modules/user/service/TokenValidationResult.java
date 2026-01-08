package com.elite.portal.modules.user.service;

import java.io.Serializable;

/**
 * DTO che rappresenta il risultato della validazione di un token di
 * registrazione per utente esterno.
 */
public class TokenValidationResult implements Serializable {

    private static final long serialVersionUID = 1L;

    private final boolean valid;
    private final String email;
    private final String errorCode;
    private final String messageKey;

    private TokenValidationResult(boolean valid, String email, String errorCode, String messageKey) {
        this.valid = valid;
        this.email = email;
        this.errorCode = errorCode;
        this.messageKey = messageKey;
    }

    public static TokenValidationResult valid(String email) {
        return new TokenValidationResult(true, email, null, null);
    }

    public static TokenValidationResult invalid(String errorCode, String messageKey) {
        return new TokenValidationResult(false, null, errorCode, messageKey);
    }

    public boolean isValid() {
        return valid;
    }

    public String getEmail() {
        return email;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getMessageKey() {
        return messageKey;
    }
}
