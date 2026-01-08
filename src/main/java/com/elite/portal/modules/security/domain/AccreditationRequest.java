package com.elite.portal.modules.security.domain;

import com.elite.portal.modules.user.domain.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Rappresenta una richiesta di accreditamento o estensione permessi in coda per l'approvazione.
 */
@Entity
@Table(name = "accreditation_requests")
public class AccreditationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Utente che ha effettuato la richiesta.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    /**
     * Tipo di richiesta: nuovo accesso o estensione permessi.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false, length = 32)
    private AccreditationRequestType requestType;

    /**
     * Stato della richiesta (PENDING, APPROVED, REJECTED).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private AccreditationRequestStatus status;

    /**
     * Data/Ora di creazione della richiesta.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Data/Ora di decisione da parte dell'approvatore.
     */
    @Column(name = "decided_at")
    private LocalDateTime decidedAt;

    /**
     * Utente che ha approvato/rifiutato la richiesta (es. IT_OPERATOR).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private User approver;

    /**
     * Note in caso di rifiuto o commenti dell'approvatore.
     */
    @Column(name = "rejection_notes", length = 1000)
    private String rejectionNotes;

    /**
     * Metadati opzionali in formato JSON (azienda/progetto di riferimento, ecc.).
     */
    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    /**
     * Soft delete / archiviazione logica della richiesta.
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public AccreditationRequest() {
        // costruttore di default
    }

    public AccreditationRequest(User requester, AccreditationRequestType requestType) {
        this.requester = requester;
        this.requestType = requestType;
        this.status = AccreditationRequestStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getRequester() {
        return requester;
    }

    public void setRequester(User requester) {
        this.requester = requester;
    }

    public AccreditationRequestType getRequestType() {
        return requestType;
    }

    public void setRequestType(AccreditationRequestType requestType) {
        this.requestType = requestType;
    }

    public AccreditationRequestStatus getStatus() {
        return status;
    }

    public void setStatus(AccreditationRequestStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getDecidedAt() {
        return decidedAt;
    }

    public void setDecidedAt(LocalDateTime decidedAt) {
        this.decidedAt = decidedAt;
    }

    public User getApprover() {
        return approver;
    }

    public void setApprover(User approver) {
        this.approver = approver;
    }

    public String getRejectionNotes() {
        return rejectionNotes;
    }

    public void setRejectionNotes(String rejectionNotes) {
        this.rejectionNotes = rejectionNotes;
    }

    public String getMetadataJson() {
        return metadataJson;
    }

    public void setMetadataJson(String metadataJson) {
        this.metadataJson = metadataJson;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}
