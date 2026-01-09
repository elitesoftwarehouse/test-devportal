package com.elite.portal.modules.user.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailSenderService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailSenderService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendActivationEmail(String toEmail, String activationLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Attivazione account Elite Portal");
        message.setText("Benvenuto su Elite Portal.\n\n" +
            "Per attivare il tuo account clicca sul seguente link:\n" +
            activationLink +
            "\n\nSe non hai richiesto la registrazione, ignora questa email.");
        mailSender.send(message);
    }
}
