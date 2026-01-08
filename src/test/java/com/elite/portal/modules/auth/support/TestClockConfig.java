package com.elite.portal.modules.auth.support;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

/**
 * Configurazione di test che fornisce un Clock fisso, utile per testare
 * scadenze dei token in modo deterministico.
 */
@TestConfiguration
public class TestClockConfig {

    @Bean
    @Primary
    public Clock testClock() {
        return Clock.fixed(Instant.parse("2024-01-01T10:00:00Z"), ZoneId.of("UTC"));
    }
}
