package com.elite.portal.modules.auth.dto;

public class EmailVerificationResponseDto {

    private boolean success;
    private String code;
    private String message;
    private boolean emailAlreadyVerified;

    public EmailVerificationResponseDto() {
    }

    public EmailVerificationResponseDto(boolean success, String code, String message, boolean emailAlreadyVerified) {
        this.success = success;
        this.code = code;
        this.message = message;
        this.emailAlreadyVerified = emailAlreadyVerified;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isEmailAlreadyVerified() {
        return emailAlreadyVerified;
    }

    public void setEmailAlreadyVerified(boolean emailAlreadyVerified) {
        this.emailAlreadyVerified = emailAlreadyVerified;
    }
}
