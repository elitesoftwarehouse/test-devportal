package com.elite.portal.modules.accreditamento.service;

import java.time.Clock;
import java.time.Instant;

import org.springframework.stereotype.Service;

import com.elite.portal.modules.accreditamento.model.AccreditamentoRequest;

@Service
public class AccreditamentoServiceImpl implements AccreditamentoService {

    private final Clock clock;

    public AccreditamentoServiceImpl(Clock clock) {
        this.clock = clock;
    }

    @Override
    public AccreditamentoRequest createAccreditamento(AccreditamentoRequest request) {
        Instant now = Instant.now(clock);
        request.setStatus("PENDING");
        request.setCreatedAt(now);
        request.setUpdatedAt(now);
        // Persistenza omessa: nei test viene mockata o verificata solo la logica temporale/stato
        return request;
    }

    @Override
    public AccreditamentoRequest getByIdAndUser(Long id, Long userId) {
        // Implementazione reale omessa; nei test questo metodo viene stub/mocked
        return null;
    }
}
