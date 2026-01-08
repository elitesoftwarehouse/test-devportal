package com.elite.portal.core.config.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;

import javax.servlet.ServletException;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RestAuthenticationEntryPointTest {

    private RestAuthenticationEntryPoint entryPoint;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        this.objectMapper = new ObjectMapper();
        this.entryPoint = new RestAuthenticationEntryPoint(objectMapper);
    }

    @Test
    void commence_ShouldReturn401WithJsonBody() throws IOException, ServletException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/secure/resource");

        MockHttpServletResponse response = new MockHttpServletResponse();

        BadCredentialsException authException = new BadCredentialsException("Bad credentials");

        entryPoint.commence(request, response, authException);

        assertEquals(401, response.getStatus());
        assertEquals(MediaType.APPLICATION_JSON_VALUE, response.getContentType());
        assertEquals("UTF-8", response.getCharacterEncoding());

        String content = response.getContentAsString();
        assertNotNull(content);
        assertTrue(content.contains("status"));
        assertTrue(content.contains("error"));
        assertTrue(content.contains("message"));
        assertTrue(content.contains("path"));

        JsonNode node = objectMapper.readTree(content);
        assertEquals(401, node.get("status").asInt());
        assertEquals("Unauthorized", node.get("error").asText());
        assertEquals("Bad credentials", node.get("message").asText());
        assertEquals("/api/secure/resource", node.get("path").asText());
        assertNotNull(node.get("timestamp"));
    }

    @Test
    void commence_ShouldHandleNullExceptionMessage() throws IOException, ServletException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/test");

        MockHttpServletResponse response = new MockHttpServletResponse();

        BadCredentialsException authException = new BadCredentialsException(null);

        entryPoint.commence(request, response, authException);

        JsonNode node = objectMapper.readTree(response.getContentAsString());
        assertEquals("Unauthorized", node.get("error").asText());
        assertEquals("Unauthorized", node.get("message").asText());
    }

    @Test
    void commence_ShouldNotOverrideCommittedResponse() throws IOException, ServletException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/committed");

        MockHttpServletResponse response = new MockHttpServletResponse();
        response.setCommitted(true);

        entryPoint.commence(request, response, new BadCredentialsException("Bad credentials"));

        // Nessuna modifica attesa perché la response è già committed
        assertEquals(200, response.getStatus());
        assertEquals("", response.getContentAsString());
    }
}
