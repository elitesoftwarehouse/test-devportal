package com.elite.portal.modules.accreditamento.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

/**
 * Controller MVC per le pagine di UI della coda richieste di accreditamento.
 * Espone le view per lista e dettaglio, delegando le operazioni dati alle API REST
 * già esistenti. Visibile solo a SYS_ADMIN e IT_OPERATOR.
 */
@Controller
@RequestMapping("/accreditamento/richieste")
@PreAuthorize("hasAnyRole('SYS_ADMIN','IT_OPERATOR')")
public class AccreditamentoRichiesteController {

    @GetMapping
    public ModelAndView listPage() {
        ModelAndView mav = new ModelAndView("accreditamento/richieste-lista");
        return mav;
    }

    @GetMapping("/{id}")
    public ModelAndView detailPage(@PathVariable("id") Long id) {
        ModelAndView mav = new ModelAndView("accreditamento/richieste-dettaglio");
        mav.addObject("richiestaId", id);
        return mav;
    }
}
