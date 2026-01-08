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
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

/**
 * REST-specific {@link AuthenticationEntryPoint} that returns a JSON error body
 * when an unauthenticated client tries to access a protected resource.
 */
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    /**
     * Creates a new {@code RestAuthenticationEntryPoint} instance.
     *
     * @param objectMapper the {@link ObjectMapper} used to serialize the error response
     */
    public RestAuthenticationEntryPoint(ObjectMapper objectMapper) {
        if (objectMapper == null) {
            throw new IllegalArgumentException("objectMapper must not be null");
        }
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        HttpStatus status = HttpStatus.UNAUTHORIZED;
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new HashMap<String, Object>();
        body.put("timestamp", OffsetDateTime.now(ZoneOffset.UTC).toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", buildMessage(authException));
        body.put("path", request.getRequestURI());

        objectMapper.writeValue(response.getOutputStream(), body);
    }

    private String buildMessage(AuthenticationException authException) {
        if (authException == null) {
            return "Full authentication is required to access this resource";
        }
        String message = authException.getMessage();
        if (message == null || message.trim().isEmpty()) {
            return "Authentication failed";
        }
        // Avoid leaking stacktrace or class names in the message
        return message.split("\n")[0];
    }
}
