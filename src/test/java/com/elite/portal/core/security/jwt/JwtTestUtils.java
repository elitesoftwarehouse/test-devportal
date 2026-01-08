package com.elite.portal.core.security.jwt;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Utility di supporto per i test JWT.
 * Fornisce metodi per creare JWT firmati e un documento JWKS a partire da una chiave pubblica.
 */
public final class JwtTestUtils {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private JwtTestUtils() {
        // utility class
    }

    /**
     * Costruisce un JWT firmato con RS256, con issuer, clientId (audience) e scopes indicati.
     *
     * @param privateKey chiave privata RSA usata per firmare il token
     * @param issuer     issuer del token
     * @param clientId   audience / client id
     * @param scopes     lista di scopes da inserire nella claim "scope" (space-separated)
     * @return token JWT serializzato
     */
    public static String buildJwt(PrivateKey privateKey, String issuer, String clientId, List<String> scopes) {
        Map<String, Object> header = new HashMap<>();
        header.put("alg", "RS256");
        header.put("typ", "JWT");
        header.put("kid", "test-key-id");

        Instant now = Instant.now();

        Map<String, Object> claims = new HashMap<>();
        claims.put("iss", issuer);
        claims.put("sub", "test-user");
        claims.put("aud", clientId);
        claims.put("iat", now.getEpochSecond());
        claims.put("exp", now.plusSeconds(600).getEpochSecond());
        claims.put("jti", UUID.randomUUID().toString());
        if (scopes != null && !scopes.isEmpty()) {
            String scopeString = String.join(" ", scopes);
            claims.put("scope", scopeString);
        }

        String headerEncoded = base64UrlEncode(toJson(header));
        String claimsEncoded = base64UrlEncode(toJson(claims));

        String signingInput = headerEncoded + "." + claimsEncoded;
        byte[] signatureBytes = signRs256(privateKey, signingInput.getBytes(StandardCharsets.UTF_8));
        String signatureEncoded = base64UrlEncode(signatureBytes);

        return signingInput + "." + signatureEncoded;
    }

    /**
     * Costruisce un documento JWKS per una singola chiave pubblica RSA.
     *
     * @param publicKey chiave pubblica RSA
     * @param keyId     identificativo della chiave (kid)
     * @return JSON JWKS serializzato
     */
    public static String buildJwksForPublicKey(PublicKey publicKey, String keyId) {
        if (!(publicKey instanceof RSAPublicKey)) {
            throw new IllegalArgumentException("PublicKey must be RSAPublicKey");
        }
        RSAPublicKey rsaPublicKey = (RSAPublicKey) publicKey;

        String n = base64UrlEncode(stripLeadingZero(rsaPublicKey.getModulus().toByteArray()));
        String e = base64UrlEncode(stripLeadingZero(rsaPublicKey.getPublicExponent().toByteArray()));

        Map<String, Object> jwk = new HashMap<>();
        jwk.put("kty", "RSA");
        jwk.put("use", "sig");
        jwk.put("alg", "RS256");
        jwk.put("kid", keyId);
        jwk.put("n", n);
        jwk.put("e", e);

        Map<String, Object> jwks = new HashMap<>();
        jwks.put("keys", new Object[]{jwk});

        return toJson(jwks);
    }

    private static String base64UrlEncode(String json) {
        return base64UrlEncode(json.getBytes(StandardCharsets.UTF_8));
    }

    private static String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String toJson(Object value) {
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize to JSON", e);
        }
    }

    private static byte[] signRs256(PrivateKey privateKey, byte[] data) {
        try {
            java.security.Signature signature = java.security.Signature.getInstance("SHA256withRSA");
            signature.initSign(privateKey);
            signature.update(data);
            return signature.sign();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to sign JWT", e);
        }
    }

    private static byte[] stripLeadingZero(byte[] bytes) {
        if (bytes.length > 1 && bytes[0] == 0x00) {
            byte[] stripped = new byte[bytes.length - 1];
            System.arraycopy(bytes, 1, stripped, 0, stripped.length);
            return stripped;
        }
        return bytes;
    }
}
