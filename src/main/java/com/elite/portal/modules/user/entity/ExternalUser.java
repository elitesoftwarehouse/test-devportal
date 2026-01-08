package com.elite.portal.modules.user.entity;

import java.time.Instant;
import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;

/**
 * Entity che rappresenta un utente esterno (professionista o collaboratore di azienda fornitrice).
 *
 * <p>Questa entity è focalizzata sugli aspetti di identità applicativa e sul flusso
 * di accreditamento/registrazione. Per semplicità non include qui i dettagli anagrafici
 * e di relazione verso l'azienda cliente/fornitore, che ci si aspetta siano modellati
 * in entity correlate nel modulo user.</p>
 */
@Entity
@Table(name = "external_user")
public class ExternalUser {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "external_user_seq")
    @SequenceGenerator(name = "external_user_seq", sequenceName = "external_user_seq", allocationSize = 1)
    private Long id;

    @Column(name = "email", nullable = false, unique = true, length = 320)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 64)
    private ExternalUserStatus status;

    /**
     * Token monouso per la registrazione iniziale.
     * Generato al passaggio in stato APPROVED_PENDING_REGISTRATION e invalidato
     * al completamento della registrazione oppure alla scadenza.
     */
    @Column(name = "registration_token", length = 128)
    private String registrationToken;

    /**
     * Data/Ora di scadenza del token di registrazione.
     */
    @Column(name = "registration_token_expires_at")
    private Instant registrationTokenExpiresAt;

    /**
     * Timestamp di completamento della registrazione iniziale (impostazione password).
     */
    @Column(name = "registration_completed_at")
    private Instant registrationCompletedAt;

    /**
     * Flag che indica se il primo login dopo la registrazione è stato completato.
     * Può essere utilizzato per presentare schermate di onboarding o obbligo di
     * cambio password al primo accesso.
     */
    @Column(name = "first_login_completed", nullable = false)
    private boolean firstLoginCompleted;

    /**
     * Hash della password. Non è oggetto diretto di questa story ma è necessario
     * per contestualizzare il completamento della registrazione.
     */
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    public ExternalUser() {
        // JPA
    }

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

    public ExternalUserStatus getStatus() {
        return status;
    }

    public void setStatus(ExternalUserStatus status) {
        this.status = status;
    }

    public String getRegistrationToken() {
        return registrationToken;
    }

    public void setRegistrationToken(String registrationToken) {
        this.registrationToken = registrationToken;
    }

    public Instant getRegistrationTokenExpiresAt() {
        return registrationTokenExpiresAt;
    }

    public void setRegistrationTokenExpiresAt(Instant registrationTokenExpiresAt) {
        this.registrationTokenExpiresAt = registrationTokenExpiresAt;
    }

    public Instant getRegistrationCompletedAt() {
        return registrationCompletedAt;
    }

    public void setRegistrationCompletedAt(Instant registrationCompletedAt) {
        this.registrationCompletedAt = registrationCompletedAt;
    }

    public boolean isFirstLoginCompleted() {
        return firstLoginCompleted;
    }

    public void setFirstLoginCompleted(boolean firstLoginCompleted) {
        this.firstLoginCompleted = firstLoginCompleted;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    /**
     * Verifica se l'utente è in stato tale da poter completare la registrazione.
     *
     * @return true se lo stato corrente è APPROVED_PENDING_REGISTRATION
     */
    public boolean canCompleteRegistration() {
        return ExternalUserStatus.APPROVED_PENDING_REGISTRATION.equals(this.status);
    }

    /**
     * Transizione di stato da APPROVED_PENDING_REGISTRATION a ACTIVE al completamento
     * della registrazione iniziale. Imposta anche i campi di tracciamento e invalida
     * il token di registrazione.
     *
     * @param completedAt timestamp di completamento registrazione
     */
    public void markRegistrationCompleted(Instant completedAt) {
        if (!canCompleteRegistration()) {
            throw new IllegalStateException("Impossibile completare la registrazione da stato " + this.status);
        }
        this.status = ExternalUserStatus.ACTIVE;
        this.registrationCompletedAt = completedAt;
        this.registrationToken = null;
        this.registrationTokenExpiresAt = null;
        this.firstLoginCompleted = false;
    }

    /**
     * Marca il completamento del primo login per eventuali logiche di onboarding.
     */
    public void markFirstLoginCompleted() {
        this.firstLoginCompleted = true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        ExternalUser that = (ExternalUser) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
