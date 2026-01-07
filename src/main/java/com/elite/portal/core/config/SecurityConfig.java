package com.elite.portal.core.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.ExpressionUrlAuthorizationConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configurazione di sicurezza per OIDC SSO con Spring Security.
 * - Risorse statiche consentite senza autenticazione.
 * - Autenticazione richiesta per ogni altra richiesta.
 * - Abilitato oauth2Login con redirect alla home dopo successo.
 * - Logout configurato con redirect alla home.
 * - CSRF abilitato di default.
 * - Opzionale: gestione h2-console se property spring.h2.console.enabled=true.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final Environment environment;

    @Autowired
    public SecurityConfig(Environment environment) {
        this.environment = environment;
    }

    /**
     * Definisce la catena di filtri di sicurezza per l'applicazione.
     *
     * Autorizzazioni:
     * - /css/**, /js/**, /images/**, /webjars/** sono accessibili senza autenticazione.
     * - Qualsiasi altra richiesta richiede autenticazione.
     *
     * Autenticazione OIDC:
     * - Abilitato oauth2Login con redirect alla home ("/") dopo accesso.
     *
     * Logout:
     * - Redirect alla home ("/") dopo logout.
     *
     * CSRF:
     * - Abilitata di default.
     *
     * Opzionale (h2-console):
     * - Se spring.h2.console.enabled=true, consente l'accesso a /h2-console/**, ignora CSRF su tale path e abilita frameOptions sameOrigin.
     *
     * @param http HttpSecurity
     * @return SecurityFilterChain configurata
     * @throws Exception in caso di errori di configurazione
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        boolean h2ConsoleEnabled = isH2ConsoleEnabled();

        ExpressionUrlAuthorizationConfigurer<HttpSecurity>.ExpressionInterceptUrlRegistry authz = http
                .authorizeRequests();

        // Risorse statiche consentite
        authz.antMatchers("/css/**", "/js/**", "/images/**", "/webjars/**").permitAll();

        // Opzionale: h2-console
        if (h2ConsoleEnabled) {
            authz.antMatchers("/h2-console/**").permitAll();
            http.headers().frameOptions().sameOrigin();
            http.csrf().ignoringAntMatchers("/h2-console/**");
        }

        // Tutto il resto autenticato
        authz.anyRequest().authenticated();

        // OIDC Login
        http.oauth2Login().defaultSuccessUrl("/", true);

        // Logout
        http.logout().logoutSuccessUrl("/");

        return http.build();
    }

    private boolean isH2ConsoleEnabled() {
        String prop = environment.getProperty("spring.h2.console.enabled", "false");
        return Boolean.parseBoolean(prop);
    }
}
