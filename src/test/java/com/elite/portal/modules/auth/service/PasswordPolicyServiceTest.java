package com.elite.portal.modules.auth.service;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class PasswordPolicyServiceTest {

    private PasswordPolicyService passwordPolicyService;

    @BeforeEach
    public void setUp() {
        passwordPolicyService = new PasswordPolicyService();
    }

    @Test
    public void testValidPassword() {
        String password = "Abcdef1!";
        Assertions.assertTrue(passwordPolicyService.isValid(password));
    }

    @Test
    public void testTooShortPassword() {
        String password = "Ab1!";
        Assertions.assertFalse(passwordPolicyService.isValid(password));
    }

    @Test
    public void testMissingUppercase() {
        String password = "abcdef1!";
        Assertions.assertFalse(passwordPolicyService.isValid(password));
    }

    @Test
    public void testMissingLowercase() {
        String password = "ABCDEF1!";
        Assertions.assertFalse(passwordPolicyService.isValid(password));
    }

    @Test
    public void testMissingDigit() {
        String password = "Abcdefg!";
        Assertions.assertFalse(passwordPolicyService.isValid(password));
    }

    @Test
    public void testMissingSpecialChar() {
        String password = "Abcdef12";
        Assertions.assertFalse(passwordPolicyService.isValid(password));
    }
}
