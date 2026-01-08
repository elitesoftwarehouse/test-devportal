package com.elite.portal.modules.user.dto;

import java.io.Serializable;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * DTO di supporto per il form di completamento registrazione
 * dei collaboratori esterni.
 */
public class ExternalRegistrationForm implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "external.registration.token.required")
    private String token;

    @NotBlank(message = "external.registration.password.required")
    @Size(min = 8, max = 64, message = "external.registration.password.size")
    private String password;

    @NotBlank(message = "external.registration.confirmPassword.required")
    private String confirmPassword;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
