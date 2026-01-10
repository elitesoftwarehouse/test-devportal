package com.eliteportal.resources.dto;

public class SkillProfileDto {

    private Long id;
    private String nome;
    private String categoria;
    private String livello;
    private Integer anniEsperienza;

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

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getLivello() {
        return livello;
    }

    public void setLivello(String livello) {
        this.livello = livello;
    }

    public Integer getAnniEsperienza() {
        return anniEsperienza;
    }

    public void setAnniEsperienza(Integer anniEsperienza) {
        this.anniEsperienza = anniEsperienza;
    }
}
