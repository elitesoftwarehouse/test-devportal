package com.elite.portal.modules.auth.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final Key key;
    private final long accessTokenValiditySeconds;

    public JwtTokenProvider(@Value("${security.jwt.secret}") String secret,
                            @Value("${security.jwt.access-token-validity-seconds:3600}") long accessTokenValiditySeconds) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.accessTokenValiditySeconds = accessTokenValiditySeconds;
    }

    public String generateToken(Long userId, String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenValiditySeconds * 1000);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("username", username)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public long getAccessTokenValiditySeconds() {
        return accessTokenValiditySeconds;
    }
}
