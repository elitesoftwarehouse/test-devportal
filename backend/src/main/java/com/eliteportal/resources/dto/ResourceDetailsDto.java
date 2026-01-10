package com.eliteportal.resources.dto;

import java.util.List;

public class ResourceDetailsDto {

    private Long id;
    private String nome;
    private String cognome;
    private String ruolo;
    private String seniority;
    private String stato;
    private CompanySummaryDto azienda;
    private List<SkillProfileDto> skillTecniche;
    private List<SkillProfileDto> softSkill;
    private List<ResourceCvDto> cvs;

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

    public String getRuolo() {
        return ruolo;
    }

    public void setRuolo(String ruolo) {
        this.ruolo = ruolo;
    }

    public String getSeniority() {
        return seniority;
    }

    public void setSeniority(String seniority) {
        this.seniority = seniority;
    }

    public String getStato() {
        return stato;
    }

    public void setStato(String stato) {
        this.stato = stato;
    }

    public CompanySummaryDto getAzienda() {
        return azienda;
    }

    public void setAzienda(CompanySummaryDto azienda) {
        this.azienda = azienda;
    }

    public List<SkillProfileDto> getSkillTecniche() {
        return skillTecniche;
    }

    public void setSkillTecniche(List<SkillProfileDto> skillTecniche) {
        this.skillTecniche = skillTecniche;
    }

    public List<SkillProfileDto> getSoftSkill() {
        return softSkill;
    }

    public void setSoftSkill(List<SkillProfileDto> softSkill) {
        this.softSkill = softSkill;
    }

    public List<ResourceCvDto> getCvs() {
        return cvs;
    }

    public void setCvs(List<ResourceCvDto> cvs) {
        this.cvs = cvs;
    }
}
