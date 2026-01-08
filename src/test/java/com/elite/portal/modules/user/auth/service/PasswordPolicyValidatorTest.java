package com.elite.portal.modules.user.auth.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class PasswordPolicyValidatorTest {

    private PasswordPolicyValidator validator;

    @BeforeEach
    void setUp() {
        validator = new PasswordPolicyValidator();
    }

    @Test
    void isPasswordValid_validPassword() {
        String password = "Str0ngPassw0rd!";
        assertTrue(validator.isPasswordValid(password));
    }

    @Test
    void isPasswordValid_tooShort() {
        String password = "Aa1!aaa";
        assertFalse(validator.isPasswordValid(password));
    }

    @Test
    void isPasswordValid_missingUppercase() {
        String password = "weakpassw0rd!";
        assertFalse(validator.isPasswordValid(password));
    }

    @Test
    void isPasswordValid_missingLowercase() {
        String password = "WEAKPASSW0RD!";
        assertFalse(validator.isPasswordValid(password));
    }

    @Test
    void isPasswordValid_missingDigit() {
        String password = "WeakPassword!";
        assertFalse(validator.isPasswordValid(password));
    }

    @Test
    void isPasswordValid_missingSpecial() {
        String password = "WeakPassw0rd";
        assertFalse(validator.isPasswordValid(password));
    }

    @Test
    void isPasswordValid_blacklisted() {
        String password = "ElitePortal123!";
        assertFalse(validator.isPasswordValid(password));
    }
}
