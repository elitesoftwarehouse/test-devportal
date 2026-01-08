package com.elite.portal.modules.user.auth.dto;

/**
 * DTO di risposta standardizzata per il completamento registrazione esterna.
 */
public class ExternalCompleteRegistrationResponse {

    private boolean success;
    private ExternalRegistrationErrorCode errorCode;
    private String message;

    public ExternalCompleteRegistrationResponse() {
    }

    public static ExternalCompleteRegistrationResponse success() {
        ExternalCompleteRegistrationResponse response = new ExternalCompleteRegistrationResponse();
        response.setSuccess(true);
        response.setMessage("Registrazione completata con successo");
        return response;
    }

    public static ExternalCompleteRegistrationResponse failure(ExternalRegistrationErrorCode errorCode, String message) {
        ExternalCompleteRegistrationResponse response = new ExternalCompleteRegistrationResponse();
        response.setSuccess(false);
        response.setErrorCode(errorCode);
        response.setMessage(message);
        return response;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public ExternalRegistrationErrorCode getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(ExternalRegistrationErrorCode errorCode) {
        this.errorCode = errorCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
