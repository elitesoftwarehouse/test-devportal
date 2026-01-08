package com.elite.portal.core.config.security;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

/**
 * Handler per le richieste autenticate che non dispongono delle autorizzazioni
 * necessarie.
 * <p>
 * Restituisce una risposta JSON con stato 403 Forbidden per le API REST.
 */
@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    /**
     * Gestisce i casi in cui un utente autenticato tenta di accedere a una
     * risorsa per cui non ha i permessi, restituendo una risposta HTTP 403
     * in formato JSON.
     *
     * @param request  la richiesta HTTP
     * @param response la risposta HTTP
     * @param accessDeniedException eccezione di accesso negato sollevata da Spring Security
     * @throws IOException in caso di errore di scrittura sulla response
     * @throws ServletException in caso di errore del container
     */
    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String message = accessDeniedException != null ? accessDeniedException.getMessage() : "Forbidden";
        String body = "{\"error\":\"forbidden\",\"message\":\"" + escapeJson(message) + "\"}";
        response.getWriter().write(body);
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
