package com.elite.portal.modules.common.web;

import com.elite.portal.modules.common.exception.BusinessException;
import com.elite.portal.modules.common.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(RestExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessException(BusinessException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (ErrorCode.INVALID_CREDENTIALS.equals(errorCode)) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (ErrorCode.LOGIN_ATTEMPTS_EXCEEDED.equals(errorCode)) {
            status = HttpStatus.TOO_MANY_REQUESTS;
        }

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("errorCode", errorCode.getCode());
        body.put("message", errorCode.getMessage());

        LOGGER.warn("BusinessException: code={} message={}", errorCode.getCode(), errorCode.getMessage());

        return new ResponseEntity<>(body, status);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", Instant.now().toString());
        body.put("errorCode", "VALIDATION_ERROR");
        body.put("message", "Dati di input non validi");
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }
}
