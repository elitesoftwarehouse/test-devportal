package com.elite.portal.core.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import java.util.Collection;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

import com.elite.portal.core.config.SecurityConfig;

/**
 * Test per la configurazione di sicurezza e la conversione degli scope JWT
 * in authorities Spring Security.
 */
public class SecurityConfigTest {

    @Test
    public void jwtAuthenticationConverter_shouldMapScopeClaimToAuthoritiesWithPrefix() {
        SecurityConfig securityConfig = new SecurityConfig();
        JwtAuthenticationConverter converter = securityConfig.jwtAuthenticationConverter();

        Jwt jwt = mock(Jwt.class, invocation -> {
            if ("getClaims".equals(invocation.getMethod().getName())) {
                return java.util.Collections.singletonMap("scope", "api.read api.write");
            }
            return invocation.callRealMethod();
        });

        Collection<GrantedAuthority> authorities = converter.convert(jwt).getAuthorities();

        assertThat(authorities)
            .extracting(GrantedAuthority::getAuthority)
            .containsExactlyInAnyOrder("SCOPE_api.read", "SCOPE_api.write");
    }

    @Test
    public void jwtAuthenticationConverter_shouldMapScpClaimArrayToAuthoritiesWithPrefix() {
        SecurityConfig securityConfig = new SecurityConfig();
        JwtAuthenticationConverter converter = securityConfig.jwtAuthenticationConverter();

        java.util.Map<String, Object> claims = new java.util.HashMap<>();
        claims.put("scp", java.util.Arrays.asList("api.read", "api.write"));

        Jwt jwt = Jwt.withTokenValue("test-token")
                .header("alg", "none")
                .claims(map -> map.putAll(claims))
                .build();

        Collection<GrantedAuthority> authorities = converter.convert(jwt).getAuthorities();

        assertThat(authorities)
            .extracting(GrantedAuthority::getAuthority)
            .containsExactlyInAnyOrder("SCOPE_api.read", "SCOPE_api.write");
    }
}
