package com.elite.portal.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import com.elite.portal.modules.user.security.ExternalUserDetailsService;
import com.elite.portal.modules.user.security.ExternalUserDetails;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Configurazione Spring Security con supporto per utenti esterni.
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final ExternalUserDetailsService userDetailsService;

    public SecurityConfig(ExternalUserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()
            .authorizeRequests()
                .antMatchers("/login", "/api/auth/login", "/css/**", "/js/**").permitAll()
                // Dashboard specifica per collaboratori esterni
                .antMatchers("/external/dashboard").hasAnyAuthority("EXTERNAL_OWNER", "EXTERNAL_COLLABORATOR")
                .anyRequest().authenticated()
            .and()
            .formLogin()
                .loginPage("/login")
                .loginProcessingUrl("/perform_login")
                .successHandler(formLoginSuccessHandler())
                .failureHandler(formLoginFailureHandler())
                .permitAll()
            .and()
            .logout()
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout")
                .permitAll();
    }

    /**
     * Gestore di successo per il login da form web: reindirizza i collaboratori
     * esterni alla dashboard dedicata.
     *
     * @return AuthenticationSuccessHandler
     */
    @Bean
    public AuthenticationSuccessHandler formLoginSuccessHandler() {
        return new AuthenticationSuccessHandler() {
            @Override
            public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                    Authentication authentication) throws IOException, ServletException {
                Object principal = authentication.getPrincipal();
                if (principal instanceof ExternalUserDetails) {
                    ExternalUserDetails details = (ExternalUserDetails) principal;
                    if (details.getDomainUser().isExternal()) {
                        response.sendRedirect("/external/dashboard");
                        return;
                    }
                }
                response.sendRedirect("/dashboard");
            }
        };
    }

    /**
     * Gestore di fallimento per il login da form web: mappa il motivo di
     * fallimento su un messaggio utente coerente.
     *
     * @return AuthenticationFailureHandler
     */
    @Bean
    public AuthenticationFailureHandler formLoginFailureHandler() {
        return new AuthenticationFailureHandler() {
            @Override
            public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                    AuthenticationException exception) throws IOException, ServletException {
                String reason = "generic";
                String message = exception.getMessage();
                if (message != null) {
                    String lower = message.toLowerCase();
                    if (lower.contains("disabled") || lower.contains("not enabled")) {
                        reason = "disabled";
                    } else if (lower.contains("blocked") || lower.contains("locked")) {
                        reason = "blocked";
                    } else if (lower.contains("not found")) {
                        reason = "notfound";
                    } else {
                        reason = "badcredentials";
                    }
                }
                response.sendRedirect("/login?error=" + reason);
            }
        };
    }

    /**
     * Encoder per le password degli utenti.
     *
     * @return PasswordEncoder
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Espone l'AuthenticationManager come bean per l'utilizzo nell'API REST.
     *
     * @return AuthenticationManager
     * @throws Exception in caso di errore di configurazione
     */
    @Bean
    @Override
    public AuthenticationManager authenticationManagerBean() throws Exception {
        return super.authenticationManagerBean();
    }
}
