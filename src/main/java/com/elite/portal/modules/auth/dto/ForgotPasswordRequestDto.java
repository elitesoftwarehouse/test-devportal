package com.elite.portal.modules.auth.dto;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

public class ForgotPasswordRequestDto {

    @NotBlank
    @Email
    private String email;

    public ForgotPasswordRequestDto() {
    }

    public ForgotPasswordRequestDto(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
