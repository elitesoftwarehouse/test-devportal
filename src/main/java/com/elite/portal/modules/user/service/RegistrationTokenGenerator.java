package com.elite.portal.modules.user.service;

import java.security.SecureRandom;
import java.util.Base64;

import org.springframework.stereotype.Component;

/**
 * Generatore di token crittograficamente sicuri per la registrazione iniziale.
 */
@Component
public class RegistrationTokenGenerator {

    private static final int DEFAULT_TOKEN_BYTES = 32;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Genera un token URL-safe randomico.
     *
     * @return token di registrazione
     */
    public String generateToken() {
        byte[] randomBytes = new byte[DEFAULT_TOKEN_BYTES];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
