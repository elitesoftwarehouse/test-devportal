package com.elite.portal.modules.auth.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class ExternalRegistrationSecurityConfig {

    @Bean
    @ConditionalOnMissingBean(name = "externalRegistrationSecurityFilterChain")
    public SecurityFilterChain externalRegistrationSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/public/external-registration/**")
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/public/external-registration/**").permitAll()
                        .anyRequest().authenticated()
                )
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/public/external-registration/**"))
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }
}
