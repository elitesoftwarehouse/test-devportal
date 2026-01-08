package com.elite.portal.modules.auth.email;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Implementazione fittizia di EmailSender da utilizzare nei test
 * di integrazione/unitari per verificare che l'email di verifica
 * venga inviata con i parametri corretti senza dipendere da un
 * provider reale.
 */
public class MockEmailSender implements EmailSender {

    private final List<SentEmail> sentEmails = new ArrayList<>();

    @Override
    public void send(String to, String subject, String body) {
        Objects.requireNonNull(to, "to must not be null");
        Objects.requireNonNull(subject, "subject must not be null");
        Objects.requireNonNull(body, "body must not be null");
        sentEmails.add(new SentEmail(to, subject, body));
    }

    public List<SentEmail> getSentEmails() {
        return Collections.unmodifiableList(sentEmails);
    }

    public void clear() {
        sentEmails.clear();
    }

    public static final class SentEmail {
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
}
