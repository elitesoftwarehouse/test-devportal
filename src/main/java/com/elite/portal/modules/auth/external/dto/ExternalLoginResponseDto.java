package com.elite.portal.modules.auth.external.dto;

public class ExternalLoginResponseDto {

    private Long userId;
    private String nome;
    private String cognome;
    private String ruolo;
    private String accessToken;
    private long expiresIn;

    public ExternalLoginResponseDto() {
    }

    public ExternalLoginResponseDto(Long userId, String nome, String cognome, String ruolo, String accessToken, long expiresIn) {
        this.userId = userId;
        this.nome = nome;
        this.cognome = cognome;
        this.ruolo = ruolo;
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public String getRuolo() {
        return ruolo;
    }

    public void setRuolo(String ruolo) {
        this.ruolo = ruolo;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
}
