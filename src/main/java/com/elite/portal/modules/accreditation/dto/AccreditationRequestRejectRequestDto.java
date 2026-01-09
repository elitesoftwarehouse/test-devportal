package com.elite.portal.modules.accreditation.dto;

import javax.validation.constraints.NotBlank;

public class AccreditationRequestRejectRequestDto {

    @NotBlank(message = "noteRifiuto is mandatory")
    private String noteRifiuto;

    public AccreditationRequestRejectRequestDto() {
    }

    public String getNoteRifiuto() {
        return noteRifiuto;
    }

    public void setNoteRifiuto(String noteRifiuto) {
        this.noteRifiuto = noteRifiuto;
    }
}
