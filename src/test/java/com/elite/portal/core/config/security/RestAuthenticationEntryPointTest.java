package com.elite.portal.core.config.security;

import java.io.IOException;
import java.util.Map;

import javax.servlet.ServletException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.AuthenticationException;

/**
 * Unit tests for {@link RestAuthenticationEntryPoint}.
 */
public class RestAuthenticationEntryPointTest {

    @Test
    public void commence_ShouldReturn401WithJsonBodyAndStandardFields() throws IOException, ServletException {
        ObjectMapper objectMapper = new ObjectMapper();
        RestAuthenticationEntryPoint entryPoint = new RestAuthenticationEntryPoint(objectMapper);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/protected");
        MockHttpServletResponse response = new MockHttpServletResponse();

        AuthenticationException authException = new AuthenticationException("Invalid token") {
            private static final long serialVersionUID = 1L;
        };

        entryPoint.commence(request, response, authException);

        Assertions.assertEquals(HttpStatus.UNAUTHORIZED.value(), response.getStatus(), "HTTP status should be 401");
        Assertions.assertEquals(MediaType.APPLICATION_JSON_VALUE, response.getContentType(), "Content-Type should be application/json");

        String content = response.getContentAsString();
        Assertions.assertNotNull(content, "Response body should not be null");
        Assertions.assertFalse(content.trim().isEmpty(), "Response body should not be empty");

        Map<String, Object> body = objectMapper.readValue(content, new TypeReference<Map<String, Object>>() { });

        Assertions.assertTrue(body.containsKey("timestamp"), "Body must contain 'timestamp'");
        Assertions.assertTrue(body.containsKey("status"), "Body must contain 'status'");
        Assertions.assertTrue(body.containsKey("error"), "Body must contain 'error'");
        Assertions.assertTrue(body.containsKey("message"), "Body must contain 'message'");
        Assertions.assertTrue(body.containsKey("path"), "Body must contain 'path'");

        Assertions.assertEquals(HttpStatus.UNAUTHORIZED.value(), ((Number) body.get("status")).intValue(), "Status field should be 401");
        Assertions.assertEquals(HttpStatus.UNAUTHORIZED.getReasonPhrase(), body.get("error"), "Error field should match reason phrase");
        Assertions.assertEquals("/api/protected", body.get("path"), "Path field should match request URI");

        Object message = body.get("message");
        Assertions.assertNotNull(message, "Message should not be null");
        String messageText = message.toString();
        Assertions.assertFalse(messageText.trim().isEmpty(), "Message should not be empty");
        Assertions.assertFalse(messageText.contains("Exception"), "Message should not contain stacktrace or exception class name");
        Assertions.assertFalse(messageText.contains("\n"), "Message should not contain newlines");
    }

    @Test
    public void commence_ShouldFallbackToDefaultMessageWhenExceptionIsNull() throws IOException, ServletException {
        ObjectMapper objectMapper = new ObjectMapper();
        RestAuthenticationEntryPoint entryPoint = new RestAuthenticationEntryPoint(objectMapper);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/secure");
        MockHttpServletResponse response = new MockHttpServletResponse();

        entryPoint.commence(request, response, null);

        String content = response.getContentAsString();
        Map<String, Object> body = objectMapper.readValue(content, new TypeReference<Map<String, Object>>() { });

        Object message = body.get("message");
        Assertions.assertNotNull(message, "Message should not be null");
        Assertions.assertFalse(message.toString().trim().isEmpty(), "Message should not be empty");
    }
}
