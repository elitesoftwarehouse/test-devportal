package com.elite.portal.modules.auth.controller;

import com.elite.portal.modules.auth.dto.ForgotPasswordRequestDto;
import com.elite.portal.modules.auth.service.ExternalPasswordResetService;
import com.elite.portal.shared.logging.AppLogger;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

public class ExternalPasswordResetControllerTest {

    @Test
    public void testForgotPassword_ReturnsNoContent() {
        ExternalPasswordResetService service = Mockito.mock(ExternalPasswordResetService.class);
        AppLogger logger = Mockito.mock(AppLogger.class);
        ExternalPasswordResetController controller = new ExternalPasswordResetController(service, logger);

        ForgotPasswordRequestDto dto = new ForgotPasswordRequestDto("user@example.com");

        ResponseEntity<Void> response = controller.forgotPassword(dto);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(service, times(1)).handleForgotPassword("user@example.com");
    }
}
