package com.elite.portal.core.config.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.PrintWriter;
import java.io.StringWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

/**
 * Test per {@link RestAccessDeniedHandler}.
 */
public class RestAccessDeniedHandlerTest {

    @Test
    public void handle_shouldReturn403WithJsonBody() throws Exception {
        RestAccessDeniedHandler handler = new RestAccessDeniedHandler();
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        AccessDeniedException exception = new AccessDeniedException("Missing scope");

        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);

        handler.handle(request, response, exception);

        verify(response).setStatus(HttpServletResponse.SC_FORBIDDEN);
        String body = stringWriter.toString();
        assertThat(body).contains("\"error\":\"forbidden\"");
        assertThat(body).contains("Missing scope");
    }
}
