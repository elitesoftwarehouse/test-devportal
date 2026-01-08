package com.elite.portal.modules.user.entity;

import java.time.Instant;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

import com.elite.portal.core.entity.ExternalAccreditationStatus;
import com.elite.portal.core.entity.SubjectType;

/**
 * Entità che rappresenta un account utente esterno registrato sul portale.
 * <p>
 * Un ExternalUser può rappresentare sia un professionista singolo (EXTERNAL_PROFESSIONAL)
 * sia un utente amministratore di un'azienda fornitrice (EXTERNAL_COMPANY).
 * <p>
 * I campi minimi richiesti in fase di registrazione sono:
 * <ul>
 *     <li>email (univoca fra gli utenti esterni)</li>
 *     <li>passwordHash</li>
 *     <li>subjectType</li>
 *     <li>nome e cognome per EXTERNAL_PROFESSIONAL</li>
 *     <li>consensoPrivacy e consensoTos</li>
 * </ul>
 */
@Entity
@Table(name = "external_user")
public class ExternalUser {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "external_user_seq")
    @SequenceGenerator(name = "external_user_seq", sequenceName = "external_user_seq", allocationSize = 1)
    private Long id;

    @Column(name = "email", nullable = false, unique = true, length = 254)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "subject_type", nullable = false, length = 32)
    private SubjectType subjectType;

    // Dati anagrafici per professionista esterno

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    /**
     * Codice fiscale per professionista singolo esterno.
     */
    @Column(name = "codice_fiscale", length = 32)
    private String codiceFiscale;

    /**
     * Partita IVA per professionista singolo, se applicabile.
     */
    @Column(name = "partita_iva", length = 32)
    private String partitaIva;

    // Collegamento opzionale all'azienda esterna, se l'utente è amministratore di un'azienda fornitrice

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "external_company_id")
    private ExternalCompany externalCompany;

    @Enumerated(EnumType.STRING)
    @Column(name = "accreditation_status", nullable = false, length = 64)
    private ExternalAccreditationStatus accreditationStatus;

    @Column(name = "privacy_consented", nullable = false)
    private boolean privacyConsented;

    @Column(name = "tos_consented", nullable = false)
    private boolean tosConsented;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public ExternalUser() {
        // Costruttore JPA
    }

    /**
     * Factory method per creare un utente esterno professionista con stato iniziale
     * REGISTERED_PENDING_ACCREDITATION.
     *
     * @param email            email univoca
     * @param passwordHash     hash della password
     * @param firstName        nome
     * @param lastName         cognome
     * @param codiceFiscale    codice fiscale opzionale
     * @param partitaIva       partita IVA opzionale
     * @param privacyConsented consenso privacy
     * @param tosConsented     consenso termini di servizio
     * @return istanza di ExternalUser configurata
     */
    public static ExternalUser newProfessional(String email,
                                               String passwordHash,
                                               String firstName,
                                               String lastName,
                                               String codiceFiscale,
                                               String partitaIva,
                                               boolean privacyConsented,
                                               boolean tosConsented) {
        Instant now = Instant.now();
        ExternalUser user = new ExternalUser();
        user.email = email;
        user.passwordHash = passwordHash;
        user.subjectType = SubjectType.EXTERNAL_PROFESSIONAL;
        user.firstName = firstName;
        user.lastName = lastName;
        user.codiceFiscale = codiceFiscale;
        user.partitaIva = partitaIva;
        user.privacyConsented = privacyConsented;
        user.tosConsented = tosConsented;
        user.accreditationStatus = ExternalAccreditationStatus.REGISTERED_PENDING_ACCREDITATION;
        user.createdAt = now;
        user.updatedAt = now;
        return user;
    }

    // Getter e setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public SubjectType getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(SubjectType subjectType) {
        this.subjectType = subjectType;
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

    public String getCodiceFiscale() {
        return codiceFiscale;
    }

    public void setCodiceFiscale(String codiceFiscale) {
        this.codiceFiscale = codiceFiscale;
    }

    public String getPartitaIva() {
        return partitaIva;
    }

    public void setPartitaIva(String partitaIva) {
        this.partitaIva = partitaIva;
    }

    public ExternalCompany getExternalCompany() {
        return externalCompany;
    }

    public void setExternalCompany(ExternalCompany externalCompany) {
        this.externalCompany = externalCompany;
    }

    public ExternalAccreditationStatus getAccreditationStatus() {
        return accreditationStatus;
    }

    public void setAccreditationStatus(ExternalAccreditationStatus accreditationStatus) {
        this.accreditationStatus = accreditationStatus;
    }

    public boolean isPrivacyConsented() {
        return privacyConsented;
    }

    public void setPrivacyConsented(boolean privacyConsented) {
        this.privacyConsented = privacyConsented;
    }

    public boolean isTosConsented() {
        return tosConsented;
    }

    public void setTosConsented(boolean tosConsented) {
        this.tosConsented = tosConsented;
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

}
