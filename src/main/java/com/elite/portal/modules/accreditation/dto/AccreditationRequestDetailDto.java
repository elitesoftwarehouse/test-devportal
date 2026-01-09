package com.elite.portal.modules.accreditation.dto;

import java.time.OffsetDateTime;

public class AccreditationRequestDetailDto {

    private Long id;
    private String requesterEmail;
    private String requesterFullName;
    private String status;
    private String requestedRoleCode;
    private OffsetDateTime createdAt;
    private Long approverId;
    private OffsetDateTime decisionDate;
    private String rejectionNotes;

    public AccreditationRequestDetailDto() {
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

    public Long getApproverId() {
        return approverId;
    }

    public void setApproverId(Long approverId) {
        this.approverId = approverId;
    }

    public OffsetDateTime getDecisionDate() {
        return decisionDate;
    }

    public void setDecisionDate(OffsetDateTime decisionDate) {
        this.decisionDate = decisionDate;
    }

    public String getRejectionNotes() {
        return rejectionNotes;
    }

    public void setRejectionNotes(String rejectionNotes) {
        this.rejectionNotes = rejectionNotes;
    }
}
