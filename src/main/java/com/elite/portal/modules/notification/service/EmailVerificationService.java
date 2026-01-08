package com.elite.portal.modules.notification.service;

import com.elite.portal.modules.notification.config.EmailVerificationProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.MessageSource;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;

@Service
public class EmailVerificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailVerificationService.class);

    private final JavaMailSender mailSender;
    private final EmailVerificationProperties properties;
    private final MessageSource messageSource;

    public EmailVerificationService(JavaMailSender mailSender,
                                    EmailVerificationProperties properties,
                                    MessageSource messageSource) {
        this.mailSender = mailSender;
        this.properties = properties;
        this.messageSource = messageSource;
    }

    /**
     * Invia l'email di verifica ad un nuovo utente.
     *
     * @param email indirizzo email del destinatario
     * @param displayName nome visualizzato (opzionale, può essere null)
     * @param verificationToken token di verifica generato lato backend
     * @param locale locale per la localizzazione dell'email
     */
    public void sendVerificationEmail(String email, String displayName, String verificationToken, Locale locale) {
        Assert.hasText(email, "email must not be empty");
        Assert.hasText(verificationToken, "verificationToken must not be empty");

        String verificationUrl;
        try {
            verificationUrl = buildVerificationUrl(verificationToken);
        } catch (IllegalStateException ex) {
            LOGGER.error("Impossibile costruire l'URL di verifica email: configurazione mancante o non valida", ex);
            return;
        }

        String subject = messageSource.getMessage(
                "email.verification.subject",
                null,
                "Verifica il tuo indirizzo email",
                locale
        );

        Object[] bodyArgs = new Object[]{displayName != null ? displayName : "",
                verificationUrl,
                properties.getTokenValidityMinutes()};

        String body = messageSource.getMessage(
                "email.verification.body",
                bodyArgs,
                "Gentile utente,\n\nper completare la registrazione clicca sul seguente link:\n{1}\n\nIl link sara' valido per {2} minuti.\n\nSe non hai richiesto questa registrazione puoi ignorare questa email.",
                locale
        );

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        if (properties.getFromAddress() != null && !properties.getFromAddress().isEmpty()) {
            message.setFrom(properties.getFromAddress());
        }
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
            LOGGER.info("Email di verifica inviata a utente con email: [hidden]");
        } catch (MailException e) {
            // L'errore viene loggato ma non propagato: la registrazione non deve fallire per problemi di invio email
            LOGGER.error("Errore durante l'invio dell'email di verifica a utente con email: [hidden]", e);
        }
    }

    /**
     * Costruisce l'URL di verifica partendo dal base URL del frontend e dal path configurato,
     * aggiungendo il token come query parameter.
     */
    protected String buildVerificationUrl(String token) {
        if (properties.getFrontendBaseUrl() == null || properties.getFrontendBaseUrl().isEmpty()) {
            throw new IllegalStateException("frontendBaseUrl non configurato per l'email di verifica");
        }

        String base = properties.getFrontendBaseUrl();

        // Normalizzazione protocollo se forceHttps abilitato
        if (properties.isForceHttps() && base.startsWith("http://")) {
            base = "https://" + base.substring("http://".length());
        }

        String path = properties.getVerificationPath();
        if (path == null) {
            path = "";
        }

        String normalizedBase = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
        String normalizedPath = path.startsWith("/") ? path : "/" + path;

        String rawUrl = normalizedBase + normalizedPath + "?token=" + token;

        try {
            // Validazione della sintassi dell'URL
            URI uri = new URI(rawUrl);
            return uri.toString();
        } catch (URISyntaxException e) {
            throw new IllegalStateException("URL di verifica non valido generato: " + rawUrl, e);
        }
    }
}
