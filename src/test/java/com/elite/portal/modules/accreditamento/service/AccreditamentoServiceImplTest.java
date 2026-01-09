package com.elite.portal.modules.accreditamento.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.elite.portal.modules.accreditamento.model.AccreditamentoRequest;

public class AccreditamentoServiceImplTest {

    private Clock fixedClock;
    private AccreditamentoServiceImpl service;

    @BeforeEach
    void setUp() {
        fixedClock = Clock.fixed(Instant.parse("2024-01-01T10:15:30.00Z"), ZoneOffset.UTC);
        service = new AccreditamentoServiceImpl(fixedClock);
    }

    @Test
    void createAccreditamento_shouldInitializeStatusAndTimestamps() {
        AccreditamentoRequest request = new AccreditamentoRequest();
        request.setEmail("user@example.com");
        request.setFirstName("Mario");
        request.setLastName("Rossi");

        AccreditamentoRequest result = service.createAccreditamento(request);

        assertThat(result.getStatus()).isEqualTo("PENDING");
        assertThat(result.getCreatedAt()).isEqualTo(Instant.parse("2024-01-01T10:15:30.00Z"));
        assertThat(result.getUpdatedAt()).isEqualTo(Instant.parse("2024-01-01T10:15:30.00Z"));
    }

    @Test
    void createAccreditamento_shouldNotOverrideUserId() {
        AccreditamentoRequest request = new AccreditamentoRequest();
        request.setUserId(123L);

        AccreditamentoRequest result = service.createAccreditamento(request);

        assertThat(result.getUserId()).isEqualTo(123L);
    }
}
