package com.elite.portal.modules.accreditamento.dto;

import java.time.OffsetDateTime;

/**
 * DTO utilizzato dal frontend per rappresentare lo stato della richiesta di accreditamento
 * dell'utente esterno.
 */
public class AccreditamentoDettaglioDto {

    private Long id;
    private String stato;
    private OffsetDateTime dataUltimaModificaStato;
    private String noteAmministratore;

    public AccreditamentoDettaglioDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStato() {
        return stato;
    }

    public void setStato(String stato) {
        this.stato = stato;
    }

    public OffsetDateTime getDataUltimaModificaStato() {
        return dataUltimaModificaStato;
    }

    public void setDataUltimaModificaStato(OffsetDateTime dataUltimaModificaStato) {
        this.dataUltimaModificaStato = dataUltimaModificaStato;
    }

    public String getNoteAmministratore() {
        return noteAmministratore;
    }

    public void setNoteAmministratore(String noteAmministratore) {
        this.noteAmministratore = noteAmministratore;
    }
}
