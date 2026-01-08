package com.elite.portal.modules.user.auth.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * DTO per la richiesta di completamento registrazione esterna.
 */
public class ExternalCompleteRegistrationRequest {

    @NotBlank(message = "Il token di registrazione è obbligatorio")
    private String token;

    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 8, max = 128, message = "La password deve avere una lunghezza compresa tra 8 e 128 caratteri")
    private String password;

    public ExternalCompleteRegistrationRequest() {
    }

    public ExternalCompleteRegistrationRequest(String token, String password) {
        this.token = token;
        this.password = password;
    }

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
}
