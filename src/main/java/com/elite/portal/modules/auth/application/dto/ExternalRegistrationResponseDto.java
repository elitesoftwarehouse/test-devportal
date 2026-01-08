package com.elite.portal.modules.auth.application.dto;

import java.util.UUID;

public class ExternalRegistrationResponseDto {

    private UUID id;
    private String type;
    private String status;
    private String email;
    private boolean canRequestAccreditation;
    private boolean emailConfirmationRequired;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isCanRequestAccreditation() {
        return canRequestAccreditation;
    }

    public void setCanRequestAccreditation(boolean canRequestAccreditation) {
        this.canRequestAccreditation = canRequestAccreditation;
    }

    public boolean isEmailConfirmationRequired() {
        return emailConfirmationRequired;
    }

    public void setEmailConfirmationRequired(boolean emailConfirmationRequired) {
        this.emailConfirmationRequired = emailConfirmationRequired;
    }
}
