package com.elite.portal.modules.auth.domain.policy;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class PasswordPolicyValidator {

    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile(".*[A-Z].*");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile(".*[a-z].*");
    private static final Pattern DIGIT_PATTERN = Pattern.compile(".*[0-9].*");
    private static final Pattern SPECIAL_PATTERN = Pattern.compile(".*[!@#$%^&*()_+\-=[\\]{};':\\\"\\|,.<>/?].*");

    public boolean isValid(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
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
        return SPECIAL_PATTERN.matcher(password).matches();
    }
}
