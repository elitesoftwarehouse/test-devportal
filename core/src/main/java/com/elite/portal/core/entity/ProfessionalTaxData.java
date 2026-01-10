package com.elite.portal.core.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "professional_tax_data")
public class ProfessionalTaxData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "professional_profile_id", nullable = false)
    private ProfessionalProfile professionalProfile;

    @Column(name = "fiscal_code", nullable = false, length = 16)
    private String fiscalCode;

    @Column(name = "vat_number", length = 11)
    private String vatNumber;

    @Column(name = "tax_regime", nullable = false, length = 50)
    private String taxRegime;

    @Column(name = "tax_address", nullable = false, length = 255)
    private String taxAddress;

    @Column(name = "tax_city", nullable = false, length = 100)
    private String taxCity;

    @Column(name = "tax_zip", nullable = false, length = 10)
    private String taxZip;

    @Column(name = "tax_province", nullable = false, length = 2)
    private String taxProvince;

    @Column(name = "tax_country", nullable = false, length = 50)
    private String taxCountry;

    @Column(name = "pec_email", nullable = false, length = 255)
    private String pecEmail;

    @Column(name = "sdi_code", length = 7)
    private String sdiCode;

    public ProfessionalTaxData() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ProfessionalProfile getProfessionalProfile() {
        return professionalProfile;
    }

    public void setProfessionalProfile(ProfessionalProfile professionalProfile) {
        this.professionalProfile = professionalProfile;
    }

    public String getFiscalCode() {
        return fiscalCode;
    }

    public void setFiscalCode(String fiscalCode) {
        this.fiscalCode = fiscalCode;
    }

    public String getVatNumber() {
        return vatNumber;
    }

    public void setVatNumber(String vatNumber) {
        this.vatNumber = vatNumber;
    }

    public String getTaxRegime() {
        return taxRegime;
    }

    public void setTaxRegime(String taxRegime) {
        this.taxRegime = taxRegime;
    }

    public String getTaxAddress() {
        return taxAddress;
    }

    public void setTaxAddress(String taxAddress) {
        this.taxAddress = taxAddress;
    }

    public String getTaxCity() {
        return taxCity;
    }

    public void setTaxCity(String taxCity) {
        this.taxCity = taxCity;
    }

    public String getTaxZip() {
        return taxZip;
    }

    public void setTaxZip(String taxZip) {
        this.taxZip = taxZip;
    }

    public String getTaxProvince() {
        return taxProvince;
    }

    public void setTaxProvince(String taxProvince) {
        this.taxProvince = taxProvince;
    }

    public String getTaxCountry() {
        return taxCountry;
    }

    public void setTaxCountry(String taxCountry) {
        this.taxCountry = taxCountry;
    }

    public String getPecEmail() {
        return pecEmail;
    }

    public void setPecEmail(String pecEmail) {
        this.pecEmail = pecEmail;
    }

    public String getSdiCode() {
        return sdiCode;
    }

    public void setSdiCode(String sdiCode) {
        this.sdiCode = sdiCode;
    }
}
