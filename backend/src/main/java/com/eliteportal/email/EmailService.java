package com.eliteportal.email;

import com.eliteportal.user.User;

public interface EmailService {

    void sendActivationEmail(User user, String activationLink, String locale);
}
