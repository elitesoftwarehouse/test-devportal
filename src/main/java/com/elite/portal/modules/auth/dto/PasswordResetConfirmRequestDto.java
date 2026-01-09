package com.elite.portal.modules.auth.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class PasswordResetConfirmRequestDto {

    @NotBlank(message = "Il token di reset è obbligatorio")
    private String token;

    @NotBlank(message = "La nuova password è obbligatoria")
    @Size(min = 8, max = 128, message = "La password deve essere compresa tra 8 e 128 caratteri")
    private String newPassword;

    public PasswordResetConfirmRequestDto() {
    }

    public PasswordResetConfirmRequestDto(String token, String newPassword) {
        this.token = token;
        this.newPassword = newPassword;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
