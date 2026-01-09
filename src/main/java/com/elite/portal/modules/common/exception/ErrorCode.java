package com.elite.portal.modules.common.exception;

public enum ErrorCode {

    INVALID_CREDENTIALS("AUTH_001", "Credenziali non valide"),
    USER_DISABLED("AUTH_002", "Utente disabilitato o bannato"),
    USER_NOT_EXTERNAL("AUTH_003", "Utente non autorizzato per login esterno"),
    LOGIN_ATTEMPTS_EXCEEDED("AUTH_004", "Numero massimo di tentativi di login superato");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
