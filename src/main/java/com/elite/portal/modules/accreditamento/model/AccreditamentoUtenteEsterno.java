package com.elite.portal.modules.accreditamento.model;

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

import com.elite.portal.modules.anagrafica.azienda.model.Azienda;
import com.elite.portal.modules.utente.model.Utente;

/**
 * Entità che rappresenta una richiesta di accreditamento proveniente da un utente esterno.
 *
 * La tabella è progettata per contenere sia le informazioni minime fornite dal richiedente
 * (dati anagrafici e di contatto) sia i riferimenti eventuali a record interni
 * (utente/azienda) quando la richiesta viene collegata ad oggetti del dominio
 * durante il processo di revisione.
 */
@Entity
@Table(name = "accreditamento_utente_esterno")
public class AccreditamentoUtenteEsterno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "cognome", nullable = false, length = 100)
    private String cognome;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "azienda_nome", nullable = true, length = 255)
    private String aziendaNome;

    @Column(name = "ruolo", nullable = true, length = 150)
    private String ruolo;

    @Column(name = "note", nullable = true, length = 2000)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", referencedColumnName = "id", nullable = true)
    private Utente utente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "azienda_id", referencedColumnName = "id", nullable = true)
    private Azienda azienda;

    @Enumerated(EnumType.STRING)
    @Column(name = "stato", nullable = false, length = 20)
    private AccreditamentoUtenteEsternoStato stato;

    @Column(name = "data_richiesta", nullable = false)
    private LocalDateTime dataRichiesta;

    @Column(name = "data_ultima_modifica", nullable = false)
    private LocalDateTime dataUltimaModifica;

    @Column(name = "utente_ultima_modifica", nullable = true, length = 100)
    private String utenteUltimaModifica;

    @Column(name = "portale_codice", nullable = true, length = 50)
    private String portaleCodice;

    public AccreditamentoUtenteEsterno() {
        // Costruttore di default richiesto da JPA
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCognome() {
        return cognome;
    }

    public void setCognome(String cognome) {
        this.cognome = cognome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAziendaNome() {
        return aziendaNome;
    }

    public void setAziendaNome(String aziendaNome) {
        this.aziendaNome = aziendaNome;
    }

    public String getRuolo() {
        return ruolo;
    }

    public void setRuolo(String ruolo) {
        this.ruolo = ruolo;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Utente getUtente() {
        return utente;
    }

    public void setUtente(Utente utente) {
        this.utente = utente;
    }

    public Azienda getAzienda() {
        return azienda;
    }

    public void setAzienda(Azienda azienda) {
        this.azienda = azienda;
    }

    public AccreditamentoUtenteEsternoStato getStato() {
        return stato;
    }

    public void setStato(AccreditamentoUtenteEsternoStato stato) {
        this.stato = stato;
    }

    public LocalDateTime getDataRichiesta() {
        return dataRichiesta;
    }

    public void setDataRichiesta(LocalDateTime dataRichiesta) {
        this.dataRichiesta = dataRichiesta;
    }

    public LocalDateTime getDataUltimaModifica() {
        return dataUltimaModifica;
    }

    public void setDataUltimaModifica(LocalDateTime dataUltimaModifica) {
        this.dataUltimaModifica = dataUltimaModifica;
    }

    public String getUtenteUltimaModifica() {
        return utenteUltimaModifica;
    }

    public void setUtenteUltimaModifica(String utenteUltimaModifica) {
        this.utenteUltimaModifica = utenteUltimaModifica;
    }

    public String getPortaleCodice() {
        return portaleCodice;
    }

    public void setPortaleCodice(String portaleCodice) {
        this.portaleCodice = portaleCodice;
    }
}
