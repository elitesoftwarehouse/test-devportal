package com.elite.portal.modules.accreditation.dto;

import java.time.OffsetDateTime;

public class AccreditationRequestListItemDto {

    private Long id;
    private String requesterEmail;
    private String requesterFullName;
    private String status;
    private String requestedRoleCode;
    private OffsetDateTime createdAt;

    public AccreditationRequestListItemDto() {
    }

    public AccreditationRequestListItemDto(Long id,
                                           String requesterEmail,
                                           String requesterFullName,
                                           String status,
                                           String requestedRoleCode,
                                           OffsetDateTime createdAt) {
        this.id = id;
        this.requesterEmail = requesterEmail;
        this.requesterFullName = requesterFullName;
        this.status = status;
        this.requestedRoleCode = requestedRoleCode;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRequesterEmail() {
        return requesterEmail;
    }

    public void setRequesterEmail(String requesterEmail) {
        this.requesterEmail = requesterEmail;
    }

    public String getRequesterFullName() {
        return requesterFullName;
    }

    public void setRequesterFullName(String requesterFullName) {
        this.requesterFullName = requesterFullName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRequestedRoleCode() {
        return requestedRoleCode;
    }

    public void setRequestedRoleCode(String requestedRoleCode) {
        this.requestedRoleCode = requestedRoleCode;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
