package com.elite.portal.modules.notification.service;

import com.elite.portal.modules.notification.config.EmailVerificationProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.support.StaticMessageSource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

public class EmailVerificationServiceTest {

    private JavaMailSender mailSender;
    private EmailVerificationProperties properties;
    private StaticMessageSource messageSource;
    private EmailVerificationService service;

    @BeforeEach
    void setUp() {
        mailSender = mock(JavaMailSender.class);
        properties = new EmailVerificationProperties();
        properties.setFromAddress("no-reply@elite-portal.test");
        properties.setFrontendBaseUrl("http://localhost:3000");
        properties.setVerificationPath("/verify-email");
        properties.setTokenValidityMinutes(30L);
        properties.setForceHttps(true);

        messageSource = new StaticMessageSource();
        messageSource.addMessage("email.verification.subject", Locale.ITALIAN, "Verifica il tuo indirizzo email");
        messageSource.addMessage("email.verification.body", Locale.ITALIAN,
                "Ciao {0},\n\nper completare la registrazione clicca sul seguente link:\n{1}\n\nIl link sara' valido per {2} minuti.");

        service = new EmailVerificationService(mailSender, properties, messageSource);
    }

    @Test
    void buildVerificationUrl_shouldForceHttpsAndAppendToken() {
        String token = "test-token";
        String url = service.buildVerificationUrl(token);

        assertThat(url).startsWith("https://");
        assertThat(url).contains("/verify-email");
        assertThat(url).contains("token=" + token);
    }

    @Test
    void buildVerificationUrl_shouldFailWhenBaseUrlMissing() {
        properties.setFrontendBaseUrl(null);
        assertThrows(IllegalStateException.class, () -> service.buildVerificationUrl("token"));
    }

    @Test
    void sendVerificationEmail_shouldUseConfiguredFromAndLocalization() {
        String email = "user@example.com";
        String displayName = "Mario Rossi";
        String token = "abc-123";

        service.sendVerificationEmail(email, displayName, token, Locale.ITALIAN);

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(captor.capture());

        SimpleMailMessage sent = captor.getValue();
        assertThat(sent.getTo()).containsExactly(email);
        assertThat(sent.getFrom()).isEqualTo("no-reply@elite-portal.test");
        assertThat(sent.getSubject()).isEqualTo("Verifica il tuo indirizzo email");
        assertThat(sent.getText()).contains("Mario Rossi");
        assertThat(sent.getText()).contains("abc-123");
    }
}
