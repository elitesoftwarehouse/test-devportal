package com.elite.portal.modules.auth.dto;

import com.elite.portal.modules.auth.model.ExternalUserType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ExternalUserRegistrationRequest {

    @NotNull(message = "Il tipo utente è obbligatorio")
    private ExternalUserType userType;

    @NotBlank(message = "Il nome è obbligatorio")
    private String firstName;

    @NotBlank(message = "Il cognome è obbligatorio")
    private String lastName;

    @Email(message = "Formato email non valido")
    @NotBlank(message = "L'email è obbligatoria")
    private String email;

    @NotBlank(message = "La password è obbligatoria")
    @Size(min = 8, max = 128, message = "La password deve avere almeno 8 caratteri")
    private String password;

    /**
     * Per utente PROFESSIONISTA non è richiesto alcun dato aziendale.
     * Per REFERENTE_AZIENDALE questo blocco è obbligatorio.
     */
    @Valid
    private ExternalCompanyPayload company;

    public ExternalUserType getUserType() {
        return userType;
    }

    public void setUserType(ExternalUserType userType) {
        this.userType = userType;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public ExternalCompanyPayload getCompany() {
        return company;
    }

    public void setCompany(ExternalCompanyPayload company) {
        this.company = company;
    }
}
