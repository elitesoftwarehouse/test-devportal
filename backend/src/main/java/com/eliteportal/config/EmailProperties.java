package com.eliteportal.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.email")
public class EmailProperties {

    private String from;
    private String activationSubjectIt;
    private String activationSubjectEn;
    private String portalBaseUrl;
    private int activationValidityHours = 24;

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getActivationSubjectIt() {
        return activationSubjectIt;
    }

    public void setActivationSubjectIt(String activationSubjectIt) {
        this.activationSubjectIt = activationSubjectIt;
    }

    public String getActivationSubjectEn() {
        return activationSubjectEn;
    }

    public void setActivationSubjectEn(String activationSubjectEn) {
        this.activationSubjectEn = activationSubjectEn;
    }

    public String getPortalBaseUrl() {
        return portalBaseUrl;
    }

    public void setPortalBaseUrl(String portalBaseUrl) {
        this.portalBaseUrl = portalBaseUrl;
    }

    public int getActivationValidityHours() {
        return activationValidityHours;
    }

    public void setActivationValidityHours(int activationValidityHours) {
        this.activationValidityHours = activationValidityHours;
    }
}
