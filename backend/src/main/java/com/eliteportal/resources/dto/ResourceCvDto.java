package com.eliteportal.resources.dto;

import java.time.OffsetDateTime;

public class ResourceCvDto {

    private Long id;
    private String titolo;
    private String nomeFile;
    private String lingua;
    private OffsetDateTime dataCreazione;
    private OffsetDateTime dataAggiornamento;
    private String contentType;
    private Long dimensione;
    private boolean principale;
    private String downloadId;
    private String downloadUrl;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitolo() {
        return titolo;
    }

    public void setTitolo(String titolo) {
        this.titolo = titolo;
    }

    public String getNomeFile() {
        return nomeFile;
    }

    public void setNomeFile(String nomeFile) {
        this.nomeFile = nomeFile;
    }

    public String getLingua() {
        return lingua;
    }

    public void setLingua(String lingua) {
        this.lingua = lingua;
    }

    public OffsetDateTime getDataCreazione() {
        return dataCreazione;
    }

    public void setDataCreazione(OffsetDateTime dataCreazione) {
        this.dataCreazione = dataCreazione;
    }

    public OffsetDateTime getDataAggiornamento() {
        return dataAggiornamento;
    }

    public void setDataAggiornamento(OffsetDateTime dataAggiornamento) {
        this.dataAggiornamento = dataAggiornamento;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getDimensione() {
        return dimensione;
    }

    public void setDimensione(Long dimensione) {
        this.dimensione = dimensione;
    }

    public boolean isPrincipale() {
        return principale;
    }

    public void setPrincipale(boolean principale) {
        this.principale = principale;
    }

    public String getDownloadId() {
        return downloadId;
    }

    public void setDownloadId(String downloadId) {
        this.downloadId = downloadId;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }
}
