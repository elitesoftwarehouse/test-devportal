package com.elite.portal.core.config.security;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

/**
 * REST-specific {@link AccessDeniedHandler} that returns a JSON error body
 * when an authenticated client is not authorized to access a resource.
 */
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    /**
     * Creates a new {@code RestAccessDeniedHandler} instance.
     *
     * @param objectMapper the {@link ObjectMapper} used to serialize the error response
     */
    public RestAccessDeniedHandler(ObjectMapper objectMapper) {
        if (objectMapper == null) {
            throw new IllegalArgumentException("objectMapper must not be null");
        }
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException, ServletException {
        HttpStatus status = HttpStatus.FORBIDDEN;
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new HashMap<String, Object>();
        body.put("timestamp", OffsetDateTime.now(ZoneOffset.UTC).toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", buildMessage(accessDeniedException));
        body.put("path", request.getRequestURI());

        objectMapper.writeValue(response.getOutputStream(), body);
    }

    private String buildMessage(AccessDeniedException accessDeniedException) {
        if (accessDeniedException == null) {
            return "Access is denied";
        }
        String message = accessDeniedException.getMessage();
        if (message == null || message.trim().isEmpty()) {
            return "Access is denied";
        }
        // Avoid leaking stacktrace or class names in the message
        return message.split("\n")[0];
    }
}
