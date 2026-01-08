package com.elite.portal.core.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

/**
 * {@code RestAuthenticationEntryPoint} gestisce i casi in cui una richiesta
 * non autenticata tenta di accedere a una risorsa protetta.
 * <p>
 * Restituisce una risposta HTTP 401 con payload JSON coerente nel formato:
 * <pre>
 * {
 *   "timestamp": "2023-10-04T15:32:10Z",
 *   "status": 401,
 *   "error": "Unauthorized",
 *   "message": "Full authentication is required to access this resource",
 *   "path": "/api/secure/resource"
 * }
 * </pre>
 * Nessuno stacktrace o dettaglio interno viene esposto al client.
 */
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    /**
     * Crea una nuova istanza usando un {@link ObjectMapper} fornito tramite
     * dependency injection.
     *
     * @param objectMapper mapper JSON da utilizzare per serializzare il payload
     */
    public RestAuthenticationEntryPoint(ObjectMapper objectMapper) {
        if (objectMapper == null) {
            throw new IllegalArgumentException("objectMapper must not be null");
        }
        // Copia configurazione per evitare effetti collaterali indesiderati
        this.objectMapper = objectMapper.copy();
        this.objectMapper.setPropertyNamingStrategy(PropertyNamingStrategies.LOWER_CAMEL_CASE);
    }

    /**
     * Gestisce l'evento di autenticazione fallita o assente producendo una
     * risposta 401 con body JSON standardizzato.
     *
     * @param request       la richiesta HTTP corrente
     * @param response      la risposta HTTP
     * @param authException l'eccezione di autenticazione generata dal contesto
     * @throws IOException      se si verifica un errore di I/O nella scrittura della risposta
     * @throws ServletException in caso di errori di livello servlet
     */
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {

        if (response.isCommitted()) {
            return;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        String path = request.getRequestURI();
        String message = authException != null && authException.getMessage() != null
                ? authException.getMessage()
                : "Unauthorized";

        ObjectNode body = objectMapper.createObjectNode();
        body.put("timestamp", OffsetDateTime.now(ZoneOffset.UTC).toString());
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "Unauthorized");
        body.put("message", message);
        body.put("path", path);

        try {
            objectMapper.writeValue(response.getWriter(), body);
        } catch (IOException ex) {
            // In caso di fallimento nella serializzazione JSON, scrive un fallback minimale
            response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\"}");
        }
    }
}
