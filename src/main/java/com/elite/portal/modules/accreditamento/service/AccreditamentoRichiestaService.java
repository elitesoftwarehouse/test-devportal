package com.elite.portal.modules.accreditamento.service;

import com.elite.portal.modules.accreditamento.api.dto.AccreditamentoRichiestaCreateRequest;
import com.elite.portal.modules.accreditamento.api.dto.AccreditamentoRichiestaResponse;
import com.elite.portal.modules.accreditamento.api.mapper.AccreditamentoRichiestaMapper;
import com.elite.portal.modules.accreditamento.domain.AccreditamentoRichiesta;
import com.elite.portal.modules.accreditamento.repository.AccreditamentoRichiestaRepository;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccreditamentoRichiestaService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AccreditamentoRichiestaService.class);

    private final AccreditamentoRichiestaRepository repository;
    private final AccreditamentoRichiestaMapper mapper;
    private final CurrentUserProvider currentUserProvider;

    public AccreditamentoRichiestaService(AccreditamentoRichiestaRepository repository,
                                          AccreditamentoRichiestaMapper mapper,
                                          CurrentUserProvider currentUserProvider) {
        this.repository = repository;
        this.mapper = mapper;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public AccreditamentoRichiestaResponse creaRichiesta(AccreditamentoRichiestaCreateRequest request) {
        Long currentUserId = currentUserProvider.getCurrentUserIdOrNull();
        String currentUserEmail = currentUserProvider.getCurrentUserEmailOrNull();
        LOGGER.info("Creazione richiesta di accreditamento per utenteId={} emailRichiesta={}", currentUserId, request.getEmail());

        AccreditamentoRichiesta entity = mapper.toEntity(request);

        if (currentUserId != null) {
            entity.setUserId(currentUserId);
        }
        if (entity.getEmail() == null && currentUserEmail != null) {
            entity.setEmail(currentUserEmail);
        }

        AccreditamentoRichiesta saved = repository.save(entity);

        LOGGER.info("Richiesta di accreditamento creata con id={}", saved.getId());

        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Optional<AccreditamentoRichiestaResponse> getRichiestaByIdForCurrentUser(Long id) {
        Long currentUserId = currentUserProvider.getCurrentUserIdOrNull();
        String currentUserEmail = currentUserProvider.getCurrentUserEmailOrNull();

        LOGGER.debug("Ricerca richiesta di accreditamento id={} per utenteId={} email={}", id, currentUserId, currentUserEmail);

        Optional<AccreditamentoRichiesta> entityOpt;
        if (currentUserId != null) {
            entityOpt = repository.findByIdAndUserId(id, currentUserId);
        } else if (currentUserEmail != null) {
            entityOpt = repository.findByIdAndEmailIgnoreCase(id, currentUserEmail);
        } else {
            entityOpt = Optional.empty();
        }

        return entityOpt.map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<AccreditamentoRichiestaResponse> getRichiesteCorrentiUtente() {
        Long currentUserId = currentUserProvider.getCurrentUserIdOrNull();
        String currentUserEmail = currentUserProvider.getCurrentUserEmailOrNull();

        LOGGER.debug("Ricerca richieste di accreditamento per utenteId={} email={}", currentUserId, currentUserEmail);

        if (currentUserId != null) {
            return mapper.toResponses(repository.findAllByUserIdOrderByCreatedAtDesc(currentUserId));
        }
        if (currentUserEmail != null) {
            return mapper.toResponses(repository.findAllByEmailIgnoreCaseOrderByCreatedAtDesc(currentUserEmail));
        }

        return List.of();
    }

    // Punti di estensione per gestione interna (approvazione/rifiuto) saranno implementati
    // qui in futuro, mantenendo separato il perimetro degli endpoint interni.
}
