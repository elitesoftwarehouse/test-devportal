package com.elite.portal.shared.email;

public interface EmailService {

    void sendPasswordResetEmail(String toEmail, String fullName, String resetLink);

}
