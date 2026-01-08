package com.elite.portal.core.config;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import com.elite.portal.core.config.security.RestAccessDeniedHandler;
import com.elite.portal.core.config.security.RestAuthenticationEntryPoint;

/**
 * Configurazione di sicurezza principale per il portale Elite.
 * <p>
 * Configura l'applicazione come Resource Server JWT proteggendo gli endpoint REST
 * sotto /api/** in modalità stateless.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String SCOPE_PREFIX = "SCOPE_";

    /**
     * Definisce la SecurityFilterChain per proteggere gli endpoint REST come
     * Resource Server JWT.
     *
     * <ul>
     *   <li>Disabilita CSRF per API e imposta la sessione come STATELESS.</li>
     *   <li>Configura gli handler per 401 (RestAuthenticationEntryPoint)
     *       e 403 (RestAccessDeniedHandler).</li>
     *   <li>Regole di autorizzazione:</li>
     *   <ul>
     *     <li>/api/public/**: accesso libero.</li>
     *     <li>GET /api/secure/**: richiede authority "SCOPE_api.read".</li>
     *     <li>POST /api/secure/**: richiede authority "SCOPE_api.write".</li>
     *     <li>Ogni altra richiesta /api/**: autenticata.</li>
     *   </ul>
     *   <li>Abilita oauth2ResourceServer().jwt() con issuer-uri definito
     *       nelle properties di Spring.</li>
     * </ul>
     *
     * @param http istanza di {@link HttpSecurity}
     * @param authenticationEntryPoint handler per autenticazione fallita (401)
     * @param accessDeniedHandler handler per accesso negato (403)
     * @return la {@link SecurityFilterChain} configurata
     * @throws Exception in caso di errore di configurazione
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   RestAuthenticationEntryPoint authenticationEntryPoint,
                                                   RestAccessDeniedHandler accessDeniedHandler) throws Exception {

        http
            .csrf()
                .disable()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .exceptionHandling()
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler)
            .and()
            .authorizeRequests()
                .antMatchers("/api/public/**").permitAll()
                .antMatchers(HttpMethod.GET, "/api/secure/**").hasAuthority("SCOPE_api.read")
                .antMatchers(HttpMethod.POST, "/api/secure/**").hasAuthority("SCOPE_api.write")
                .antMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            .and()
            .oauth2ResourceServer()
                .jwt()
                .jwtAuthenticationConverter(jwtAuthenticationConverter());

        return http.build();
    }

    /**
     * Converte un {@link Jwt} in un'autenticazione Spring Security popolando
     * le {@link GrantedAuthority} a partire dai claim "scope" o "scp".
     * <p>
     * I valori dei claim vengono trasformati in authorities con prefisso
     * "SCOPE_" (es. "api.read" -> "SCOPE_api.read").
     *
     * @return il converter configurato per la gestione degli scope.
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(this::extractAuthoritiesFromJwt);
        return converter;
    }

    private Collection<GrantedAuthority> extractAuthoritiesFromJwt(Jwt jwt) {
        List<String> scopes = extractScopes(jwt);
        if (scopes.isEmpty()) {
            return Collections.emptyList();
        }
        return scopes.stream()
                .map(scope -> SCOPE_PREFIX + scope)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private List<String> extractScopes(Jwt jwt) {
        Object scopeClaim = jwt.getClaims().get("scope");
        Object scpClaim = jwt.getClaims().get("scp");

        Stream<String> scopeStream = Stream.empty();
        Stream<String> scpStream = Stream.empty();

        if (scopeClaim instanceof String) {
            String scopeString = (String) scopeClaim;
            if (!scopeString.isBlank()) {
                scopeStream = Stream.of(scopeString.split(" "));
            }
        } else if (scopeClaim instanceof Collection) {
            scopeStream = ((Collection<Object>) scopeClaim).stream()
                    .map(Object::toString);
        }

        if (scpClaim instanceof String) {
            String scpString = (String) scpClaim;
            if (!scpString.isBlank()) {
                scpStream = Stream.of(scpString.split(" "));
            }
        } else if (scpClaim instanceof Collection) {
            scpStream = ((Collection<Object>) scpClaim).stream()
                    .map(Object::toString);
        }

        return Stream.concat(scopeStream, scpStream)
                .filter(s -> s != null && !s.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }
}
