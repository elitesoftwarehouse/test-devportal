package com.elite.portal.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configurazione di sicurezza per l'integrazione SSO OIDC tramite Spring Security.
 *
 * Requisiti implementati:
 * - Accesso libero alle risorse statiche (css, js, images, webjars);
 * - Autenticazione richiesta per tutte le altre richieste;
 * - oauth2Login abilitato con redirect alla root ("/") su successo di login;
 * - Logout configurato con redirect alla root ("/");
 * - CSRF abilitato (impostazione di default in Spring Security).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Definisce la catena dei filtri di sicurezza per l'applicazione.
     *
     * @param http l'istanza di HttpSecurity configurata dal contesto Spring
     * @return la SecurityFilterChain costruita
     * @throws Exception in caso di errore di configurazione
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeRequests(authorize -> authorize
                .antMatchers(
                    "/css/**",
                    "/js/**",
                    "/images/**",
                    "/webjars/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("/", true)
            )
            .logout(logout -> logout
                .logoutSuccessUrl("/")
            );

        // CSRF abilitato di default (nessuna configurazione aggiuntiva necessaria)
        return http.build();
    }
}
