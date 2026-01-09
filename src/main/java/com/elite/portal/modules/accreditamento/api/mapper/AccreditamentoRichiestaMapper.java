package com.elite.portal.modules.accreditamento.api.mapper;

import com.elite.portal.modules.accreditamento.api.dto.AccreditamentoRichiestaCreateRequest;
import com.elite.portal.modules.accreditamento.api.dto.AccreditamentoRichiestaResponse;
import com.elite.portal.modules.accreditamento.domain.AccreditamentoRichiesta;
import com.elite.portal.modules.accreditamento.domain.AccreditamentoStato;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class AccreditamentoRichiestaMapper {

    public AccreditamentoRichiesta toEntity(AccreditamentoRichiestaCreateRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        AccreditamentoRichiesta entity = new AccreditamentoRichiesta();
        entity.setEmail(request.getEmail());
        entity.setNome(request.getNome());
        entity.setCognome(request.getCognome());
        entity.setAzienda(request.getAzienda());
        entity.setNote(request.getNote());
        entity.setStato(AccreditamentoStato.INVIATA);
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);
        return entity;
    }

    public AccreditamentoRichiestaResponse toResponse(AccreditamentoRichiesta entity) {
        AccreditamentoRichiestaResponse response = new AccreditamentoRichiestaResponse();
        response.setId(entity.getId());
        response.setEmail(entity.getEmail());
        response.setNome(entity.getNome());
        response.setCognome(entity.getCognome());
        response.setAzienda(entity.getAzienda());
        response.setNote(entity.getNote());
        response.setStato(entity.getStato());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }

    public List<AccreditamentoRichiestaResponse> toResponses(List<AccreditamentoRichiesta> entities) {
        return entities.stream().map(this::toResponse).collect(Collectors.toList());
    }
}
