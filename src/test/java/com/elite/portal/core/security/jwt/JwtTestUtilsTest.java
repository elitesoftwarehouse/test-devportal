package com.elite.portal.core.security.jwt;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Test di unità per {@link JwtTestUtils}.
 */
class JwtTestUtilsTest {

    @Test
    void generateRsaJwkPair_shouldReturnValidRsaKeyWithPrivateAndPublicParts() {
        RSAKey rsaKey = JwtTestUtils.generateRsaJwkPair();

        Assertions.assertNotNull(rsaKey, "RSAKey non deve essere null");
        Assertions.assertTrue(rsaKey.isPrivate(), "La chiave generata deve contenere la parte privata");
        Assertions.assertNotNull(rsaKey.toPublicJWK(), "La chiave generata deve avere una parte pubblica");
        Assertions.assertEquals(JWSAlgorithm.RS256, rsaKey.getAlgorithm(), "Algoritmo atteso RS256");
        Assertions.assertNotNull(rsaKey.getKeyID(), "kid deve essere valorizzato");
    }

    @Test
    void buildJwksJson_shouldProduceValidJwksStructure() {
        RSAKey rsaKey = JwtTestUtils.generateRsaJwkPair();
        String jwksJson = JwtTestUtils.buildJwksJson(rsaKey);

        Assertions.assertNotNull(jwksJson, "JWKS JSON non deve essere null");
        Assertions.assertTrue(jwksJson.startsWith("{\"keys\":["), "Il JWKS deve iniziare con l'array 'keys'");
        Assertions.assertTrue(jwksJson.endsWith("]}"), "Il JWKS deve terminare correttamente con ']}'");
        Assertions.assertTrue(jwksJson.contains("\"kid\""), "Il JWKS deve contenere il campo kid");
        Assertions.assertTrue(jwksJson.contains("\"kty\""), "Il JWKS deve contenere il campo kty");
        Assertions.assertTrue(jwksJson.contains("\"n\""), "Il JWKS deve contenere il campo n");
        Assertions.assertTrue(jwksJson.contains("\"e\""), "Il JWKS deve contenere il campo e");
    }

    @Test
    void buildJwt_shouldGenerateSignedJwtWithExpectedClaimsAndHeader() throws Exception {
        RSAKey rsaKey = JwtTestUtils.generateRsaJwkPair();
        List<String> scopes = Arrays.asList("read", "write", "admin");

        String issuer = "https://issuer.example.com";
        String subject = "user-123";

        String token = JwtTestUtils.buildJwt(rsaKey, issuer, subject, scopes);

        Assertions.assertNotNull(token, "Il token generato non deve essere null");

        SignedJWT parsed = SignedJWT.parse(token);

        // Verifica header
        Assertions.assertEquals(JWSAlgorithm.RS256, parsed.getHeader().getAlgorithm(), "Algoritmo di firma atteso RS256");
        Assertions.assertEquals(rsaKey.getKeyID(), parsed.getHeader().getKeyID(), "kid in header deve corrispondere a quello della chiave");

        // Verifica claims
        JWTClaimsSet claims = parsed.getJWTClaimsSet();
        Assertions.assertEquals(issuer, claims.getIssuer(), "Issuer non corrispondente");
        Assertions.assertEquals(subject, claims.getSubject(), "Subject non corrispondente");
        Assertions.assertNotNull(claims.getIssueTime(), "Claim iat deve essere valorizzato");
        Assertions.assertNotNull(claims.getExpirationTime(), "Claim exp deve essere valorizzato");
        Assertions.assertNotNull(claims.getJWTID(), "Claim jti deve essere valorizzato");

        Object scopeClaim = claims.getClaim("scope");
        Assertions.assertTrue(scopeClaim instanceof String, "Il claim scope deve essere una stringa");
        String scopeString = (String) scopeClaim;
        Assertions.assertEquals("read write admin", scopeString, "Scope space-delimited non corrispondenti");
    }

    @Test
    void buildJwt_withoutScopes_shouldNotSetScopeClaim() throws Exception {
        RSAKey rsaKey = JwtTestUtils.generateRsaJwkPair();
        String token = JwtTestUtils.buildJwt(rsaKey, "issuer", "subject", Collections.emptyList());

        SignedJWT parsed = SignedJWT.parse(token);
        JWTClaimsSet claims = parsed.getJWTClaimsSet();

        Assertions.assertNull(claims.getClaim("scope"), "Il claim scope non deve essere presente quando la lista è vuota");
    }

    @Test
    void parseClaims_shouldReturnClaimsSetFromValidToken() {
        RSAKey rsaKey = JwtTestUtils.generateRsaJwkPair();
        String token = JwtTestUtils.buildJwt(rsaKey, "issuer", "subject", Arrays.asList("s1"));

        JWTClaimsSet claimsSet = JwtTestUtils.parseClaims(token);

        Assertions.assertEquals("issuer", claimsSet.getIssuer(), "Issuer non corrispondente");
        Assertions.assertEquals("subject", claimsSet.getSubject(), "Subject non corrispondente");
    }

    @Test
    void parseClaims_withNullToken_shouldThrowIllegalArgumentException() {
        Assertions.assertThrows(IllegalArgumentException.class, () -> JwtTestUtils.parseClaims(null));
    }

    @Test
    void buildJwksJson_withNullKey_shouldThrowIllegalArgumentException() {
        Assertions.assertThrows(NullPointerException.class, () -> JwtTestUtils.buildJwksJson(null));
    }

    @Test
    void buildJwt_withNonPrivateKey_shouldThrowIllegalArgumentException() {
        RSAKey rsaKey = JwtTestUtils.generateRsaJwkPair().toPublicJWK();
        Assertions.assertThrows(IllegalArgumentException.class,
                () -> JwtTestUtils.buildJwt(rsaKey, "issuer", "subject", null));
    }
}
