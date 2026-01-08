package com.elite.portal.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class ExternalCompanyPayload {

    /**
     * Se valorizzato, indica che l'utente si associa ad una azienda esistente.
     */
    private Long existingCompanyId;

    /**
     * Se existingCompanyId è nullo, si utilizza questo blocco per creare una nuova azienda.
     */
    private boolean createNewCompany;

    @NotBlank(message = "La ragione sociale è obbligatoria per la creazione di una nuova azienda")
    private String companyName;

    private String vatNumber;

    private String taxCode;

    private String address;

    public Long getExistingCompanyId() {
        return existingCompanyId;
    }

    public void setExistingCompanyId(Long existingCompanyId) {
        this.existingCompanyId = existingCompanyId;
    }

    public boolean isCreateNewCompany() {
        return createNewCompany;
    }

    public void setCreateNewCompany(boolean createNewCompany) {
        this.createNewCompany = createNewCompany;
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

    public String getTaxCode() {
        return taxCode;
    }

    public void setTaxCode(String taxCode) {
        this.taxCode = taxCode;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}
