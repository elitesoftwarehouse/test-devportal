package com.elite.portal.modules.auth.service;

import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class PasswordPolicyService {

    private static final int MIN_LENGTH = 8;
    private static final int MAX_LENGTH = 128;

    private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile(".*[a-z].*");
    private static final Pattern DIGIT_PATTERN = Pattern.compile(".*[0-9].*");
    private static final Pattern SPECIAL_PATTERN = Pattern.compile(".*[^A-Za-z0-9].*");

    public boolean isValid(String password) {
        if (password == null) {
            return false;
        }
        if (password.length() < MIN_LENGTH || password.length() > MAX_LENGTH) {
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
        return true;
    }

    public String getValidationMessage() {
        return "La password non rispetta i requisiti di sicurezza (lunghezza minima " + MIN_LENGTH
                + ", presenza di maiuscole, minuscole, numeri e caratteri speciali).";
    }
}
