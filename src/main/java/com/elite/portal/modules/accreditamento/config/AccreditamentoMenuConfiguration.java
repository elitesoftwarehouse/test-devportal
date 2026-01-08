package com.elite.portal.modules.accreditamento.config;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.elite.portal.shared.menu.MenuItemDefinition;
import com.elite.portal.shared.menu.MenuRegistry;

/**
 * Configurazione voce di menu per l'accesso alla coda richieste di accreditamento.
 * La voce è visibile solo a utenti con ruolo SYS_ADMIN o IT_OPERATOR.
 */
@Component
public class AccreditamentoMenuConfiguration {

    private final MenuRegistry menuRegistry;

    @Autowired
    public AccreditamentoMenuConfiguration(MenuRegistry menuRegistry) {
        this.menuRegistry = menuRegistry;
    }

    @PostConstruct
    public void registerMenuItems() {
        MenuItemDefinition richiesteAccreditamento = MenuItemDefinition.builder()
            .id("accreditamento-richieste")
            .labelKey("menu.accreditamento.richieste")
            .icon("fa fa-user-check")
            .url("/accreditamento/richieste")
            .order(50)
            .requiredAnyRole("SYS_ADMIN", "IT_OPERATOR")
            .build();

        menuRegistry.register(richiesteAccreditamento);
    }
}
