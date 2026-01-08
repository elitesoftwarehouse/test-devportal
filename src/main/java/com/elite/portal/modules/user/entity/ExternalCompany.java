package com.elite.portal.modules.user.entity;

import java.time.Instant;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import java.util.HashSet;
import java.util.Set;

import com.elite.portal.core.entity.ExternalAccreditationStatus;
import com.elite.portal.core.entity.SubjectType;

/**
 * Entità che rappresenta un'azienda fornitrice esterna registrata.
 * <p>
 * I campi minimi richiesti in fase di registrazione sono:
 * <ul>
 *     <li>ragione sociale</li>
 *     <li>partita IVA</li>
 *     <li>email di riferimento (tipicamente dell'amministratore)</li>
 *     <li>indirizzo sede (almeno una stringa libera)</li>
 *     <li>consenso privacy e ToS (salvati a livello di utente amministratore)</li>
 * </ul>
 * La relazione con ExternalUser permette di collegare uno o più account amministrativi
 * all'azienda fornitrice.
 */
@Entity
@Table(name = "external_company")
public class ExternalCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "external_company_seq")
    @SequenceGenerator(name = "external_company_seq", sequenceName = "external_company_seq", allocationSize = 1)
    private Long id;

    @Column(name = "subject_type", nullable = false, length = 32)
    @Enumerated(EnumType.STRING)
    private SubjectType subjectType = SubjectType.EXTERNAL_COMPANY;

    @Column(name = "ragione_sociale", nullable = false, length = 255)
    private String ragioneSociale;

    @Column(name = "partita_iva", nullable = false, length = 32)
    private String partitaIva;

    @Column(name = "reference_email", nullable = false, length = 254)
    private String referenceEmail;

    @Column(name = "address", nullable = false, length = 512)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "accreditation_status", nullable = false, length = 64)
    private ExternalAccreditationStatus accreditationStatus;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "externalCompany")
    private Set<ExternalUser> users = new HashSet<ExternalUser>();

    public ExternalCompany() {
        // Costruttore JPA
    }

    /**
     * Factory method per creare una nuova azienda esterna con stato iniziale
     * REGISTERED_PENDING_ACCREDITATION.
     *
     * @param ragioneSociale ragione sociale
     * @param partitaIva     partita IVA
     * @param referenceEmail email di riferimento
     * @param address        indirizzo della sede
     * @return istanza di ExternalCompany configurata
     */
    public static ExternalCompany newCompany(String ragioneSociale,
                                             String partitaIva,
                                             String referenceEmail,
                                             String address) {
        Instant now = Instant.now();
        ExternalCompany company = new ExternalCompany();
        company.ragioneSociale = ragioneSociale;
        company.partitaIva = partitaIva;
        company.referenceEmail = referenceEmail;
        company.address = address;
        company.accreditationStatus = ExternalAccreditationStatus.REGISTERED_PENDING_ACCREDITATION;
        company.createdAt = now;
        company.updatedAt = now;
        company.subjectType = SubjectType.EXTERNAL_COMPANY;
        return company;
    }

    // Getter e setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SubjectType getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectType subjectType) {
        this.subjectType = subjectType;
    }

    public String getRagioneSociale() {
        return ragioneSociale;
    }

    public void setRagioneSociale(String ragioneSociale) {
        this.ragioneSociale = ragioneSociale;
    }

    public String getPartitaIva() {
        return partitaIva;
    }

    public void setPartitaIva(String partitaIva) {
        this.partitaIva = partitaIva;
    }

    public String getReferenceEmail() {
        return referenceEmail;
    }

    public void setReferenceEmail(String referenceEmail) {
        this.referenceEmail = referenceEmail;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public ExternalAccreditationStatus getAccreditationStatus() {
        return accreditationStatus;
    }

    public void setAccreditationStatus(ExternalAccreditationStatus accreditationStatus) {
        this.accreditationStatus = accreditationStatus;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Set<ExternalUser> getUsers() {
        return users;
    }

    public void setUsers(Set<ExternalUser> users) {
        this.users = users;
    }

}
