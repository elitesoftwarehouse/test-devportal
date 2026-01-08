package com.elite.portal.core.config.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

/**
 * Entry point per le richieste non autenticate.
 * <p>
 * Restituisce una risposta JSON con stato 401 Unauthorized per le API REST.
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    /**
     * Gestisce i tentativi di accesso a risorse protette senza autenticazione
     * valida, restituendo una risposta HTTP 401 in formato JSON.
     *
     * @param request  la richiesta HTTP
     * @param response la risposta HTTP
     * @param authException eccezione di autenticazione sollevata da Spring Security
     * @throws IOException in caso di errore di scrittura sulla response
     * @throws ServletException in caso di errore del container
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String message = authException != null ? authException.getMessage() : "Unauthorized";
        String body = "{\"error\":\"unauthorized\",\"message\":\"" + escapeJson(message) + "\"}";
        response.getWriter().write(body);
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
