package com.elite.portal.modules.user.auth.service;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Componente per la validazione della policy password per gli utenti esterni.
 */
@Component
public class PasswordPolicyValidator {

    private static final int MIN_LENGTH = 12;
    private static final int MAX_LENGTH = 128;

    private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile(".*[a-z].*");
    private static final Pattern DIGIT_PATTERN = Pattern.compile(".*[0-9].*");
    private static final Pattern SPECIAL_PATTERN = Pattern.compile(".*[!@#$%^&*()_+\\-=[\\]{};':\\\"\\\\|,<.>/?].*");

    // Semplice blacklist di esempio; in un sistema reale potrebbe provenire da configurazione esterna.
    private static final String[] BLACKLIST = new String[] {
            "password", "123456", "qwerty", "admin", "eliteportal"
    };

    /**
     * Verifica se la password rispetta la policy di sicurezza.
     *
     * @param password password in chiaro da validare
     * @return true se la password è valida, false altrimenti
     */
    public boolean isPasswordValid(String password) {
        if (password == null) {
            return false;
        }
        int length = password.length();
        if (length < MIN_LENGTH || length > MAX_LENGTH) {
            return false;
        }

        if (!UPPERCASE_PATTERN.matcher(password).matches()) {
            return false;
        }
        if (!LOWERCASE_PATTERN.matcher(password).matches()) {
            return false;
        }
        if (!DIGIT_PATTERN.matcher(password).matches()) {
            return false;
        }
        if (!SPECIAL_PATTERN.matcher(password).matches()) {
            return false;
        }

        String lower = password.toLowerCase();
        for (String bad : BLACKLIST) {
            if (lower.contains(bad)) {
                return false;
            }
        }

        return true;
    }
}
