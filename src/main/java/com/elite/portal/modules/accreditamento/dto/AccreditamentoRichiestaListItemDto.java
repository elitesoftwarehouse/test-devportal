package com.elite.portal.modules.accreditamento.dto;

import java.time.LocalDateTime;

/**
 * DTO per un elemento di lista della coda richieste di accreditamento.
 */
public class AccreditamentoRichiestaListItemDto {

    private Long id;
    private String richiedente;
    private String tipoRichiesta;
    private String stato;
    private LocalDateTime dataCreazione;
    private String aziendaOProgetto;

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

    public String getAziendaOProgetto() {
        return aziendaOProgetto;
    }

    public void setAziendaOProgetto(String aziendaOProgetto) {
        this.aziendaOProgetto = aziendaOProgetto;
    }
}
