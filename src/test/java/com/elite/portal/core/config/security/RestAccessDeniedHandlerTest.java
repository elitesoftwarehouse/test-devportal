package com.elite.portal.core.config.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;

import javax.servlet.ServletException;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * Test di unità per {@link RestAccessDeniedHandler}.
 */
class RestAccessDeniedHandlerTest {

    private RestAccessDeniedHandler handler;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        this.objectMapper = new ObjectMapper();
        this.handler = new RestAccessDeniedHandler(objectMapper);
    }

    @Test
    void handle_ShouldReturnForbiddenJsonResponse() throws IOException, ServletException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/protected/resource");

        MockHttpServletResponse response = new MockHttpServletResponse();

        AccessDeniedException exception = new AccessDeniedException("User does not have required role");

        handler.handle(request, response, exception);

        assertEquals(HttpStatus.FORBIDDEN.value(), response.getStatus());
        assertEquals(MediaType.APPLICATION_JSON_VALUE, response.getContentType());

        String content = response.getContentAsString();
        assertNotNull(content);

        JsonNode jsonNode = objectMapper.readTree(content);

        // Verifica campi base del payload
        assertEquals(HttpStatus.FORBIDDEN.value(), jsonNode.get("status").asInt());
        assertEquals(HttpStatus.FORBIDDEN.getReasonPhrase(), jsonNode.get("error").asText());
        assertEquals("Access is denied", jsonNode.get("message").asText());
        assertEquals("/api/protected/resource", jsonNode.get("path").asText());

        // timestamp deve essere presente e non nullo
        assertNotNull(jsonNode.get("timestamp"));
    }
}
