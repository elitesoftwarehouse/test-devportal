package com.elite.portal.core.security.jwt;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSObject;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

/**
 * Utility di supporto per i test JWT.
 * <p>
 * Questa classe fornisce metodi statici per:
 * <ul>
 *     <li>Generare una coppia di chiavi RSA Nimbus (privata + pubblica) con kid e parametri coerenti.</li>
 *     <li>Costruire la rappresentazione JSON di un JWKS contenente una chiave pubblica RSA per firma (use=sig, alg=RS256).</li>
 *     <li>Generare un JWT RS256 firmato con claim standard e scope space-delimited, utilizzando la chiave privata fornita.</li>
 * </ul>
 * <p>
 * La classe è pensata esclusivamente per l'utilizzo in test di integrazione/unitari.
 */
public final class JwtTestUtils {

    private static final JWSAlgorithm DEFAULT_JWS_ALGORITHM = JWSAlgorithm.RS256;
    private static final int DEFAULT_KEY_SIZE = 2048;
    private static final int DEFAULT_EXPIRATION_MINUTES = 10;

    private JwtTestUtils() {
        // Utility class, non istanziabile
    }

    /**
     * Genera una nuova coppia di chiavi RSA Nimbus (privata + pubblica) con:
     * <ul>
     *     <li>Dimensione chiave: 2048 bit.</li>
     *     <li>Algoritmo: RS256.</li>
     *     <li>Uso: signature (use = sig).</li>
     *     <li>kid generato randomicamente tramite UUID.</li>
     * </ul>
     *
     * @return un {@link RSAKey} che contiene sia la chiave privata che quella pubblica.
     * @throws IllegalStateException se la generazione della chiave fallisce.
     */
    public static RSAKey generateRsaJwkPair() {
        try {
            String keyId = UUID.randomUUID().toString();

            return new RSAKeyGenerator(DEFAULT_KEY_SIZE)
                    .keyUse(KeyUse.SIGNATURE)
                    .algorithm(DEFAULT_JWS_ALGORITHM)
                    .keyID(keyId)
                    .generate();
        } catch (JOSEException e) {
            throw new IllegalStateException("Errore durante la generazione della coppia di chiavi RSA JWK", e);
        }
    }

    /**
     * Costruisce una rappresentazione JSON di un JWKS contenente esclusivamente
     * la chiave pubblica derivata dall'oggetto {@link RSAKey} fornito.
     * <p>
     * Il JSON prodotto segue la struttura standard RFC7517:
     * <pre>
     * {
     *   "keys": [ { ... publicJwk ... } ]
     * }
     * </pre>
     *
     * @param publicJwk chiave RSA pubblica (o full key da cui sarà estratta la parte pubblica).
     * @return stringa JSON rappresentante il JWKS.
     * @throws IllegalArgumentException se il parametro è {@code null} o non contiene parametri pubblici.
     */
    public static String buildJwksJson(RSAKey publicJwk) {
        Objects.requireNonNull(publicJwk, "publicJwk non deve essere null");

        RSAKey publicOnly = publicJwk.toPublicJWK();
        if (publicOnly == null) {
            throw new IllegalArgumentException("Impossibile ottenere la porzione pubblica del RSAKey fornito");
        }

        String jwkJson = publicOnly.toJSONString();
        return "{\"keys\":[" + jwkJson + "]}";
    }

    /**
     * Genera un JWT firmato con RS256 utilizzando la chiave privata fornita.
     * <p>
     * Il token conterrà i seguenti claim standard:
     * <ul>
     *     <li><b>iss</b>: issuer fornito in input.</li>
     *     <li><b>sub</b>: subject fornito in input.</li>
     *     <li><b>iat</b>: data emissione (ora corrente).</li>
     *     <li><b>exp</b>: data scadenza (ora corrente + 10 minuti di default).</li>
     *     <li><b>jti</b>: identificativo univoco generato tramite UUID.</li>
     *     <li><b>scope</b>: stringa space-delimited contenente gli scope forniti.</li>
     * </ul>
     * L'header JWS includerà:
     * <ul>
     *     <li><b>alg</b>: RS256.</li>
     *     <li><b>kid</b>: derivato dal kid del {@link RSAKey} fornito, se presente.</li>
     *     <li><b>typ</b>: JWT.</li>
     * </ul>
     *
     * @param privateJwk chiave RSA Nimbus contenente la chiave privata utilizzata per la firma.
     * @param issuer     valore del claim {@code iss}.
     * @param subject    valore del claim {@code sub}.
     * @param scopes     elenco degli scope; se {@code null} o vuoto non verrà impostato il claim {@code scope}.
     * @return stringa compatta del JWT firmato (serialization compatta).
     * @throws IllegalArgumentException se {@code privateJwk} è {@code null} o non contiene la chiave privata.
     * @throws IllegalStateException    in caso di errore durante la firma o la costruzione del token.
     */
    public static String buildJwt(RSAKey privateJwk, String issuer, String subject, List<String> scopes) {
        Objects.requireNonNull(privateJwk, "privateJwk non deve essere null");

        if (!privateJwk.isPrivate()) {
            throw new IllegalArgumentException("Il RSAKey fornito deve contenere la chiave privata per firmare il JWT");
        }

        Instant now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        Instant expiration = now.plus(DEFAULT_EXPIRATION_MINUTES, ChronoUnit.MINUTES);

        JWTClaimsSet.Builder claimsBuilder = new JWTClaimsSet.Builder()
                .issuer(issuer)
                .subject(subject)
                .issueTime(Date.from(now))
                .expirationTime(Date.from(expiration))
                .jwtID(UUID.randomUUID().toString());

        if (scopes != null && !scopes.isEmpty()) {
            String scopeValue = String.join(" ", scopes);
            claimsBuilder.claim("scope", scopeValue);
        }

        JWTClaimsSet claimsSet = claimsBuilder.build();

        JWSHeader.Builder headerBuilder = new JWSHeader.Builder(DEFAULT_JWS_ALGORITHM)
                .type(com.nimbusds.jose.util.Base64URL.encode("JWT"))
                .keyID(privateJwk.getKeyID());

        // Typ deve essere un JOSEHeaderParameterType, usiamo il costruttore tipico con stringa
        JWSHeader header;
        try {
            // Ricreiamo l'header in modo standard con typ = JWT (come stringa)
            header = new JWSHeader.Builder(DEFAULT_JWS_ALGORITHM)
                    .type(com.nimbusds.jose.HeaderParameterNames.TYPE == null ? null : com.nimbusds.jose.util.Base64URL.encode("JWT"))
                    .keyID(privateJwk.getKeyID())
                    .build();
        } catch (Exception ex) {
            // Fallback: header minimale con alg e kid
            header = new JWSHeader.Builder(DEFAULT_JWS_ALGORITHM)
                    .keyID(privateJwk.getKeyID())
                    .build();
        }

        SignedJWT signedJWT = new SignedJWT(header, claimsSet);

        try {
            JWSSigner signer = new RSASSASigner(privateJwk.toPrivateKey());
            signedJWT.sign(signer);
        } catch (JOSEException e) {
            throw new IllegalStateException("Errore durante la firma del JWT", e);
        }

        return signedJWT.serialize();
    }

    /**
     * Verifica che il JWT fornito sia un token firmato RS256 valido dal punto di vista sintattico,
     * e restituisce il set di claim associati. Metodo di supporto per i test che richiedono di
     * ispezionare un token generato.
     *
     * @param jwtString rappresentazione compatta del JWT.
     * @return {@link JWTClaimsSet} associato al token.
     * @throws IllegalArgumentException se il token è nullo o vuoto.
     * @throws IllegalStateException    se il token non è parseable come {@link SignedJWT}.
     */
    public static JWTClaimsSet parseClaims(String jwtString) {
        if (jwtString == null || jwtString.isBlank()) {
            throw new IllegalArgumentException("jwtString non deve essere null o vuoto");
        }

        try {
            SignedJWT signedJWT = SignedJWT.parse(jwtString);
            return signedJWT.getJWTClaimsSet();
        } catch (ParseException e) {
            throw new IllegalStateException("Impossibile effettuare il parse del JWT fornito", e);
        }
    }
}
