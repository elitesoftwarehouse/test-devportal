package com.elite.portal.modules.auth.service;

import com.elite.portal.modules.user.domain.ExternalUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class SessionInvalidationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SessionInvalidationService.class);

    public void invalidateSessionsForUser(ExternalUser user) {
        if (user == null) {
            return;
        }
        // Implementazione concreta dipendente dal meccanismo di sessione/token già presente sul portale.
        // Qui viene effettuato solo un log di tracciamento.
        LOGGER.info("Invalidazione delle sessioni attive per l'utente esterno con id {}", user.getId());
    }
}
