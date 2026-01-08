package com.elite.portal.core.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.access.AccessDeniedHandler;

/**
 * Configurazione dei componenti di gestione errori per la sicurezza,
 * tra cui l'handler REST per gli accessi negati (403).
 */
@Configuration
public class SecurityErrorHandlerConfig {

    /**
     * Definisce il bean {@link AccessDeniedHandler} utilizzato per le risposte REST 403.
     *
     * @param objectMapper mapper JSON condiviso dell'applicazione
     * @return istanza di {@link RestAccessDeniedHandler}
     */
    @Bean
    public AccessDeniedHandler restAccessDeniedHandler(ObjectMapper objectMapper) {
        return new RestAccessDeniedHandler(objectMapper);
    }
}
