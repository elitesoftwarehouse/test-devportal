package com.elite.portal.modules.auth.support;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

import com.elite.portal.modules.auth.service.AuthEmailService;

/**
 * Mock thread-safe per AuthEmailService da utilizzare nei test di integrazione.
 * Registra le email inviate senza inoltrarle realmente.
 */
public class TestAuthEmailServiceMock implements AuthEmailService {

    public static class SentEmail {
        private final String to;
        private final String subject;
        private final String body;

        public SentEmail(String to, String subject, String body) {
            this.to = to;
            this.subject = subject;
            this.body = body;
        }

        public String getTo() {
            return to;
        }

        public String getSubject() {
            return subject;
        }

        public String getBody() {
            return body;
        }
    }

    private final List<SentEmail> emails = Collections.synchronizedList(new ArrayList<>());

    @Override
    public void sendPasswordResetEmail(String email, String resetToken) {
        Objects.requireNonNull(email, "email must not be null");
        Objects.requireNonNull(resetToken, "resetToken must not be null");
        emails.add(new SentEmail(email, "RESET_PASSWORD", resetToken));
    }

    @Override
    public void sendExternalLoginLink(String email, String loginToken) {
        Objects.requireNonNull(email, "email must not be null");
        Objects.requireNonNull(loginToken, "loginToken must not be null");
        emails.add(new SentEmail(email, "EXTERNAL_LOGIN", loginToken));
    }

    public List<SentEmail> getEmails() {
        synchronized (emails) {
            return new ArrayList<>(emails);
        }
    }

    public void clear() {
        emails.clear();
    }
}
