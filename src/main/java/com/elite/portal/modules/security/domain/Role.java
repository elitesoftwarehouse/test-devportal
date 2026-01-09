package com.elite.portal.modules.security.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Rappresenta un ruolo di sistema assegnabile agli utenti.
 * Esempi: SYS_ADMIN, IT_OPERATOR, EXTERNAL_USER_PENDING.
 */
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Codice univoco del ruolo (es. SYS_ADMIN, IT_OPERATOR).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "code", nullable = false, unique = true, length = 64)
    private RoleCode code;

    /**
     * Descrizione leggibile del ruolo.
     */
    @Column(name = "description", nullable = false, length = 255)
    private String description;

    /**
     * Timestamp di creazione record.
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp di ultimo aggiornamento.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Soft delete: se valorizzato, il ruolo è considerato eliminato/logicamente disattivo.
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public Role() {
        // costruttore di default richiesto da JPA
    }

    public Role(RoleCode code, String description) {
        this.code = code;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public RoleCode getCode() {
        return code;
    }

    public void setCode(RoleCode code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
}
