package com.elite.portal.modules.auth.service;

import com.elite.portal.modules.auth.dto.ExternalRegistrationRequest;
import com.elite.portal.modules.auth.dto.ExternalRegistrationResponse;
import org.springframework.stereotype.Service;

@Service
public class ExternalRegistrationService {

    public ExternalRegistrationResponse registerExternal(ExternalRegistrationRequest request) {
        ExternalRegistrationResponse response = new ExternalRegistrationResponse();
        // Integrazione con API di registrazione esistente o logica di business.
        // Qui si assume che la chiamata sia delegata a un client REST o a un componente dedicato.
        // Per ora simuliamo un esito positivo.
        response.setSuccess(true);
        response.setMessage("Registrazione completata, potrai ora inviare una richiesta di accreditamento.");
        return response;
    }
}
