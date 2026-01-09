package com.elite.portal.modules.accreditamento.dto;

/**
 * DTO per i filtri di ricerca della coda richieste.
 */
public class AccreditamentoRichiestaFilterDto {

    private String stato;
    private String query;

    public String getStato() {
        return stato;
    }

    public void setStato(String stato) {
        this.stato = stato;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
