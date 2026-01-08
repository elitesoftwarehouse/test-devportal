package com.elite.portal.shared.api;

import java.time.OffsetDateTime;
import java.util.Locale;

public class ErrorResponse {

    private String code;
    private String message;
    private int status;
    private OffsetDateTime timestamp;

    public static ErrorResponse of(String code, String message, int status, Locale locale) {
        ErrorResponse response = new ErrorResponse();
        response.setCode(code);
        response.setMessage(message);
        response.setStatus(status);
        response.setTimestamp(OffsetDateTime.now());
        return response;
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

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
