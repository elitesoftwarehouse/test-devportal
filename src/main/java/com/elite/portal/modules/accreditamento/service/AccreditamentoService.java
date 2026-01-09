package com.elite.portal.modules.accreditamento.service;

import com.elite.portal.modules.accreditamento.model.AccreditamentoRequest;

public interface AccreditamentoService {

    AccreditamentoRequest createAccreditamento(AccreditamentoRequest request);

    AccreditamentoRequest getByIdAndUser(Long id, Long userId);
}
