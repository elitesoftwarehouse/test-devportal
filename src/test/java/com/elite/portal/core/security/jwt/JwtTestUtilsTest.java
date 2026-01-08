package com.elite.portal.core.security.jwt;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.security.KeyPair;
import java.security.KeyPairGenerator;

/**
 * Test di base per JwtTestUtils per assicurare che i metodi non lancino eccezioni
 * e producano stringhe non vuote.
 */
class JwtTestUtilsTest {

    @Test
    void buildJwt_shouldReturnNonEmptyString() throws Exception {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();

        String token = JwtTestUtils.buildJwt(keyPair.getPrivate(), "http://issuer", "client", java.util.Collections.singletonList("api.read"));

        Assertions.assertNotNull(token);
        Assertions.assertFalse(token.isEmpty());
        Assertions.assertTrue(token.split("\\.").length == 3);
    }

    @Test
    void buildJwksForPublicKey_shouldReturnNonEmptyJson() throws Exception {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();

        String jwks = JwtTestUtils.buildJwksForPublicKey(keyPair.getPublic(), "kid1");

        Assertions.assertNotNull(jwks);
        Assertions.assertFalse(jwks.isEmpty());
        Assertions.assertTrue(jwks.contains("\"keys\""));
        Assertions.assertTrue(jwks.contains("\"kid\""));
    }
}
