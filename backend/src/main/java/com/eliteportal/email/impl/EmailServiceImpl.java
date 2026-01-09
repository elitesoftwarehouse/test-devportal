package com.eliteportal.email.impl;

import com.eliteportal.config.EmailProperties;
import com.eliteportal.email.EmailService;
import com.eliteportal.user.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.lang.Nullable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;
    private final EmailProperties emailProperties;

    @Autowired
    public EmailServiceImpl(JavaMailSender mailSender, EmailProperties emailProperties) {
        this.mailSender = mailSender;
        this.emailProperties = emailProperties;
    }

    @Override
    public void sendActivationEmail(User user, String activationLink, @Nullable String locale) {
        String effectiveLocale = (locale == null || locale.isBlank()) ? "it" : locale.toLowerCase();
        String subject = resolveSubject(effectiveLocale);
        String body = buildBody(user, activationLink, effectiveLocale);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, StandardCharsets.UTF_8.name());
            helper.setFrom(emailProperties.getFrom());
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(mimeMessage);
            LOGGER.info("Activation email successfully sent to {}", user.getEmail());
        } catch (MessagingException | RuntimeException ex) {
            LOGGER.error("Error while sending activation email to {}", user.getEmail(), ex);
            // Qui si potrebbe integrare un meccanismo di retry asincrono o una coda di messaggi
        }
    }

    private String resolveSubject(String locale) {
        if ("en".equals(locale)) {
            return emailProperties.getActivationSubjectEn();
        }
        return emailProperties.getActivationSubjectIt();
    }

    private String buildBody(User user, String activationLink, String locale) {
        String templatePath;
        if ("en".equals(locale)) {
            templatePath = "templates/email/activation_en.html";
        } else {
            templatePath = "templates/email/activation_it.html";
        }

        try {
            ClassPathResource resource = new ClassPathResource(templatePath);
            String template = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            String fullName = user.getFirstName() + " " + user.getLastName();
            String role = user.getRequestedRole() != null ? user.getRequestedRole() : "";

            template = template.replace("{{fullName}}", escape(fullName));
            template = template.replace("{{role}}", escape(role));
            template = template.replace("{{activationLink}}", activationLink);
            template = template.replace("{{validityHours}}", String.valueOf(emailProperties.getActivationValidityHours()));

            return template;
        } catch (IOException ex) {
            LOGGER.error("Could not load activation email template, falling back to plain text", ex);
            return buildFallbackBody(user, activationLink, locale);
        }
    }

    private String buildFallbackBody(User user, String activationLink, String locale) {
        String fullName = user.getFirstName() + " " + user.getLastName();
        if ("en".equals(locale)) {
            return "Dear " + fullName + ",\n\n" +
                   "thank you for registering to Elite Portal. Please activate your account using the following link (valid for " +
                   emailProperties.getActivationValidityHours() + " hours):\n" +
                   activationLink + "\n\n" +
                   "If you did not request this registration, you can ignore this email.\n\n" +
                   "Best regards,\nElite Portal Support";
        }
        return "Gentile " + fullName + ",\n\n" +
               "grazie per la registrazione a Elite Portal. Per favore attivi il suo account utilizzando il seguente link (valido per " +
               emailProperties.getActivationValidityHours() + " ore):\n" +
               activationLink + "\n\n" +
               "Se non ha richiesto questa registrazione, può ignorare questa email.\n\n" +
               "Cordiali saluti,\nSupporto Elite Portal";
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("<", "&lt;").replace(">", "&gt;");
    }
}
