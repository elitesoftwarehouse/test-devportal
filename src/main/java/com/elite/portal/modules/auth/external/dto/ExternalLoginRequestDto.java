package com.elite.portal.modules.auth.external.dto;

import jakarta.validation.constraints.NotBlank;

public class ExternalLoginRequestDto {

    @NotBlank
    private String usernameOrEmail;

    @NotBlank
    private String password;

    public ExternalLoginRequestDto() {
    }

    public ExternalLoginRequestDto(String usernameOrEmail, String password) {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
    }

    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
