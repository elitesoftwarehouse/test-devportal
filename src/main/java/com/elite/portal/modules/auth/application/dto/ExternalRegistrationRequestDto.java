package com.elite.portal.modules.auth.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ExternalRegistrationRequestDto {

    @NotBlank(message = "external.registration.type.required")
    private String type;

    @NotBlank(message = "external.registration.email.required")
    @Email(message = "external.registration.email.invalid")
    private String email;

    @NotBlank(message = "external.registration.password.required")
    @Size(min = 8, max = 128, message = "external.registration.password.size")
    private String password;

    @NotNull(message = "external.registration.terms.required")
    private Boolean termsAccepted;

    @NotNull(message = "external.registration.privacy.required")
    private Boolean privacyAccepted;

    // Campi per PROFESSIONAL
    private String firstName;
    private String lastName;

    // Campi per COMPANY
    private String companyName;
    private String vatNumber;

    // Flag opzionale per gestione conferma email lato architettura
    private boolean emailConfirmationRequired = true;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public Boolean isTermsAccepted() {
        return termsAccepted;
    }

    public void setTermsAccepted(Boolean termsAccepted) {
        this.termsAccepted = termsAccepted;
    }

    public Boolean isPrivacyAccepted() {
        return privacyAccepted;
    }

    public void setPrivacyAccepted(Boolean privacyAccepted) {
        this.privacyAccepted = privacyAccepted;
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

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getVatNumber() {
        return vatNumber;
    }

    public void setVatNumber(String vatNumber) {
        this.vatNumber = vatNumber;
    }

    public boolean isEmailConfirmationRequired() {
        return emailConfirmationRequired;
    }

    public void setEmailConfirmationRequired(boolean emailConfirmationRequired) {
        this.emailConfirmationRequired = emailConfirmationRequired;
    }
}
