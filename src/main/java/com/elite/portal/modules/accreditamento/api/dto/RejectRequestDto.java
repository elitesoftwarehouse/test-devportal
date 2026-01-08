package com.elite.portal.modules.accreditamento.api.dto;

public class RejectRequestDto {

    private Long approverId;
    private String note;

    public Long getApproverId() {
        return approverId;
    }

    public void setApproverId(Long approverId) {
        this.approverId = approverId;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
