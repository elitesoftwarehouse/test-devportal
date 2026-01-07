package com.elite.portal.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configurazione di Spring Security per SSO OIDC e protezione degli endpoint.
 * - Consente accesso pubblico alle risorse statiche.
 * - Abilita oauth2Login con redirect alla home dopo login.
 * - Configura logout con redirect alla home.
 * - CSRF abilitato di default.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Definisce la SecurityFilterChain principale dell'applicazione.
     *
     * @param http HttpSecurity da configurare
     * @return SecurityFilterChain configurata
     * @throws Exception se la configurazione fallisce
     */
    @Bean
    public SecurityFilterChain securityFilterChain(final HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests()
                .antMatchers("/css/**", "/js/**", "/images/**", "/webjars/**").permitAll()
                .anyRequest().authenticated()
            .and()
            .oauth2Login()
                .defaultSuccessUrl("/", true)
            .and()
            .logout()
                .logoutSuccessUrl("/");

        // CSRF è abilitato di default in Spring Security.
        return http.build();
    }
}
