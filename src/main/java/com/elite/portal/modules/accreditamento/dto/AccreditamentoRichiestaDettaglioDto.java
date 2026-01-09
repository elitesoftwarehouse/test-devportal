package com.elite.portal.modules.accreditamento.dto;

import java.time.LocalDateTime;

/**
 * DTO per il dettaglio completo di una richiesta di accreditamento.
 */
public class AccreditamentoRichiestaDettaglioDto {

    private Long id;
    private String richiedente;
    private String emailRichiedente;
    private String tipoRichiesta;
    private String stato;
    private LocalDateTime dataCreazione;
    private LocalDateTime dataDecisione;
    private String gestitaDa;
    private String aziendaOProgetto;
    private String dettagliRichiesta;
    private String motivazioneRifiuto;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRichiedente() {
        return richiedente;
    }

    public void setRichiedente(String richiedente) {
        this.richiedente = richiedente;
    }

    public String getEmailRichiedente() {
        return emailRichiedente;
    }

    public void setEmailRichiedente(String emailRichiedente) {
        this.emailRichiedente = emailRichiedente;
    }

    public String getTipoRichiesta() {
        return tipoRichiesta;
    }

    public void setTipoRichiesta(String tipoRichiesta) {
        this.tipoRichiesta = tipoRichiesta;
    }

    public String getStato() {
        return stato;
    }

    public void setStato(String stato) {
        this.stato = stato;
    }

    public LocalDateTime getDataCreazione() {
        return dataCreazione;
    }

    public void setDataCreazione(LocalDateTime dataCreazione) {
        this.dataCreazione = dataCreazione;
    }

    public LocalDateTime getDataDecisione() {
        return dataDecisione;
    }

    public void setDataDecisione(LocalDateTime dataDecisione) {
        this.dataDecisione = dataDecisione;
    }

    public String getGestitaDa() {
        return gestitaDa;
    }

    public void setGestitaDa(String gestitaDa) {
        this.gestitaDa = gestitaDa;
    }

    public String getAziendaOProgetto() {
        return aziendaOProgetto;
    }

    public void setAziendaOProgetto(String aziendaOProgetto) {
        this.aziendaOProgetto = aziendaOProgetto;
    }

    public String getDettagliRichiesta() {
        return dettagliRichiesta;
    }

    public void setDettagliRichiesta(String dettagliRichiesta) {
        this.dettagliRichiesta = dettagliRichiesta;
    }

    public String getMotivazioneRifiuto() {
        return motivazioneRifiuto;
    }

    public void setMotivazioneRifiuto(String motivazioneRifiuto) {
        this.motivazioneRifiuto = motivazioneRifiuto;
    }
}
