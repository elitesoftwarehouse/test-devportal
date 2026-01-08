package com.elite.portal.core.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

/**
 * {@code RestAccessDeniedHandler} gestisce le situazioni in cui una richiesta
 * autenticata non possiede i permessi necessari per accedere alla risorsa.
 * <p>
 * Restituisce una risposta HTTP 403 con payload JSON nel formato:
 * <pre>
 * {
 *   "timestamp": "2024-01-01T12:00:00Z",
 *   "status": 403,
 *   "error": "Forbidden",
 *   "message": "Access is denied",
 *   "path": "/api/example"
 * }
 * </pre>
 * Non vengono inclusi dettagli sensibili dell'eccezione per motivi di sicurezza.
 */
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    /**
     * Crea una nuova istanza di {@link RestAccessDeniedHandler} utilizzando
     * l'istanza di {@link ObjectMapper} fornita tramite dependency injection.
     *
     * @param objectMapper mapper JSON da utilizzare per serializzare il payload di errore
     */
    public RestAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Gestisce un accesso negato restituendo una risposta JSON con stato 403.
     *
     * @param request  la richiesta HTTP corrente
     * @param response la risposta HTTP da popolare
     * @param accessDeniedException l'eccezione che rappresenta l'accesso negato
     * @throws IOException      in caso di errori di I/O durante la scrittura della risposta
     * @throws ServletException in caso di altri errori legati al servlet container
     */
    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {

        HttpStatus status = HttpStatus.FORBIDDEN;

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", OffsetDateTime.now(ZoneOffset.UTC));
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        // Messaggio generico per evitare di esporre dettagli sensibili
        body.put("message", "Access is denied");
        body.put("path", request.getRequestURI());

        String json = objectMapper.writeValueAsString(body);
        response.getWriter().write(json);
        response.getWriter().flush();
    }
}
