package com.elite.portal.modules.accreditamento.api.dto;

import java.time.LocalDateTime;

import com.elite.portal.modules.accreditamento.model.AccreditationStatus;

public class RequestAccrDto {

    private Long id;
    private String externalEmail;
    private AccreditationStatus status;
    private LocalDateTime creationDate;
    private LocalDateTime decisionDate;
    private Long approverId;
    private String rejectNote;
    private Long externalUserId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getExternalEmail() {
        return externalEmail;
    }

    public void setExternalEmail(String externalEmail) {
        this.externalEmail = externalEmail;
    }

    public AccreditationStatus getStatus() {
        return status;
    }

    public void setStatus(AccreditationStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    public LocalDateTime getDecisionDate() {
        return decisionDate;
    }

    public void setDecisionDate(LocalDateTime decisionDate) {
        this.decisionDate = decisionDate;
    }

    public Long getApproverId() {
        return approverId;
    }

    public void setApproverId(Long approverId) {
        this.approverId = approverId;
    }

    public String getRejectNote() {
        return rejectNote;
    }

    public void setRejectNote(String rejectNote) {
        this.rejectNote = rejectNote;
    }

    public Long getExternalUserId() {
        return externalUserId;
    }

    public void setExternalUserId(Long externalUserId) {
        this.externalUserId = externalUserId;
    }
}
