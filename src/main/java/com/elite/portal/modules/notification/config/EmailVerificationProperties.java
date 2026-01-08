package com.elite.portal.modules.notification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "elite.portal.email-verification")
public class EmailVerificationProperties {

    /**
     * Indirizzo email mittente per le email di verifica.
     */
    private String fromAddress;

    /**
     * Durata di validità del token di verifica in minuti.
     */
    private long tokenValidityMinutes = 60L;

    /**
     * URL base del frontend (es. https://portal.elite.com).
     */
    private String frontendBaseUrl;

    /**
     * Path relativo dell'endpoint di verifica sul frontend (es. /verify-email).
     */
    private String verificationPath = "/verify-email";

    /**
     * Forzare HTTPS per gli URL generati.
     */
    private boolean forceHttps = true;

    public String getFromAddress() {
        return fromAddress;
    }

    public void setFromAddress(String fromAddress) {
        this.fromAddress = fromAddress;
    }

    public long getTokenValidityMinutes() {
        return tokenValidityMinutes;
    }

    public void setTokenValidityMinutes(long tokenValidityMinutes) {
        this.tokenValidityMinutes = tokenValidityMinutes;
    }

    public String getFrontendBaseUrl() {
        return frontendBaseUrl;
    }

    public void setFrontendBaseUrl(String frontendBaseUrl) {
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public String getVerificationPath() {
        return verificationPath;
    }

    public void setVerificationPath(String verificationPath) {
        this.verificationPath = verificationPath;
    }

    public boolean isForceHttps() {
        return forceHttps;
    }

    public void setForceHttps(boolean forceHttps) {
        this.forceHttps = forceHttps;
    }
}
