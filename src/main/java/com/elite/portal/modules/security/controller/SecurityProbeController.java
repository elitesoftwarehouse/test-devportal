package com.elite.portal.modules.security.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller di probing per verificare il comportamento della security
 * lato API. Espone endpoint pubblici e protetti per testare JWT, scopes
 * e regole di accesso configurate in SecurityConfig.
 */
@RestController
@RequestMapping(path = "/api", produces = MediaType.TEXT_PLAIN_VALUE)
public class SecurityProbeController {

    /**
     * Endpoint pubblico non soggetto ad autenticazione.
     *
     * @return stringa fissa "public-ok".
     */
    @GetMapping(path = "/public/ping")
    public ResponseEntity<String> publicPing() {
        return ResponseEntity.ok("public-ok");
    }

    /**
     * Endpoint protetto soggetto alle regole di SecurityConfig.
     * Tipicamente richiederà un JWT valido ma senza un requisito di scope
     * specifico, a meno di diversa configurazione nel SecurityConfig.
     *
     * @return stringa fissa "secure-ok".
     */
    @GetMapping(path = "/secure/ping")
    public ResponseEntity<String> securePing() {
        return ResponseEntity.ok("secure-ok");
    }

    /**
     * Endpoint protetto che richiede esplicitamente lo scope "api.write".
     *
     * Il body ricevuto viene ritornato così com'è (echo) per consentire
     * test rapidi del comportamento di autorizzazione e della propagazione
     * del payload.
     *
     * @param payload contenuto della richiesta POST.
     * @return lo stesso payload ricevuto in input.
     */
    @PostMapping(path = "/secure/echo", consumes = MediaType.TEXT_PLAIN_VALUE)
    @PreAuthorize("hasAuthority('SCOPE_api.write')")
    public ResponseEntity<String> secureEcho(@RequestBody(required = false) String payload) {
        String safePayload = payload != null ? payload : "";
        return ResponseEntity.ok(safePayload);
    }
}
