package com.elite.portal.modules.auth.dto;

import org.springframework.validation.FieldError;

import java.util.ArrayList;
import java.util.List;

public class ExternalRegistrationResponse {

    private boolean success;
    private String message;
    private List<FieldError> fieldErrors = new ArrayList<>();

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<FieldError> getFieldErrors() {
        return fieldErrors;
    }

    public void setFieldErrors(List<FieldError> fieldErrors) {
        this.fieldErrors = fieldErrors;
    }
}
