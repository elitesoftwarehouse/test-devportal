# Elite Portal — SSO OIDC (Spring Security)

Questo documento descrive come configurare ed eseguire il login SSO OIDC nell'applicazione, i prerequisiti richiesti e le linee guida di sicurezza.

Epic: Epic 1 — Identità e Accesso (SSO OIDC e RBAC)
User Story: Login SSO OIDC con Spring Security e visualizzazione utente

1) Panoramica funzionalità SSO OIDC
- L'applicazione utilizza Spring Security (OAuth2 Client) per eseguire il login tramite un Identity Provider (IdP) compatibile OpenID Connect (OIDC).
- Il flusso di autenticazione è Authorization Code (con PKCE se supportato dal provider).
- Al termine del login, l'utente viene reindirizzato al portale e il suo nome (claim preferito, es. name) è mostrato nella UI.
- In locale, il redirect URI è http://localhost:8080/login/oauth2/code/company (dove "company" è il registrationId usato nell'app).

2) Prerequisiti
- Un provider OIDC aziendale o di test (es. Keycloak, Okta, Azure AD, Auth0, Google) con:
  - Issuer (issuer-uri) raggiungibile pubblicamente o in rete locale (per test).
  - Client ID (confidential client) e Client Secret.
  - Grant type: authorization_code
  - Scopes consigliati: openid, profile, email
- Consentire l'uso di http per localhost, se il provider lo richiede espressamente per ambienti di sviluppo.

3) Variabili d'ambiente richieste
Impostare le seguenti variabili prima di avviare l'applicazione:
- OIDC_CLIENT_ID: Client ID rilasciato dal provider OIDC
- OIDC_CLIENT_SECRET: Client Secret rilasciato dal provider OIDC
- OIDC_ISSUER_URI: Issuer URI del provider (es. https://idp.example.com/realms/myrealm)

Esempi di export:
- macOS/Linux (bash/zsh):
  export OIDC_CLIENT_ID="..."
  export OIDC_CLIENT_SECRET="..."
  export OIDC_ISSUER_URI="https://idp.example.com/realms/myrealm"

- Windows PowerShell:
  setx OIDC_CLIENT_ID "..."
  setx OIDC_CLIENT_SECRET "..."
  setx OIDC_ISSUER_URI "https://idp.example.com/realms/myrealm"
  (riaprire la shell dopo setx)

4) Redirect URI da configurare sul provider
- Aggiungere tra i redirect/callback consentiti sul provider:
  http://localhost:8080/login/oauth2/code/company

Nota: "company" è il registrationId configurato nell'applicazione. Se modificate il registrationId, dovete aggiornare sia il redirect URI sul provider sia la configurazione locale.

5) Configurazione applicativa (Spring Boot)
L'app si aspetta le variabili d'ambiente sopra e definisce la registrazione OIDC nel profilo standard. Un esempio di configurazione application.yml può essere:

spring:
  security:
    oauth2:
      client:
        registration:
          company:
            client-id: ${OIDC_CLIENT_ID}
            client-secret: ${OIDC_CLIENT_SECRET}
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
            scope: openid, profile, email
        provider:
          company:
            issuer-uri: ${OIDC_ISSUER_URI}

Suggerimenti:
- issuer-uri deve puntare all'issuer OIDC, non all'endpoint di autorizzazione/token (es. Keycloak: https://host/realms/<realm>, Okta: https://dev-xxx.okta.com/oauth2/default).
- Se l'app gira dietro proxy/ingress in ambienti non locali, impostare correttamente Forwarded/ X-Forwarded-* e server.forward-headers-strategy.

6) Avvio in locale
Prerequisiti: Java 17, Maven installati.

- Passo 1: Esportare le variabili d'ambiente richieste (vedi sezione 3).
- Passo 2: Eseguire l'applicazione:
  mvn spring-boot:run
- Passo 3: Aprire il browser su http://localhost:8080 e cliccare sul login (se presente) o accedere a una pagina protetta: verrete reindirizzati al provider OIDC e, dopo l'autenticazione, riportati al portale.
- Verifica: Dopo il login, la UI mostra il nome dell'utente autenticato (claim name o simile).

7) Troubleshooting (errori comuni)
- redirect_uri_mismatch / invalid_redirect_uri:
  - Verificare che il redirect URI configurato sul provider coincida esattamente con quello usato dall'app (protocollo, host, porta, path).
  - In locale usare http, non https, a meno di configurazione esplicita con certificati.
  - Assicurarsi che il registrationId sia company se usate l'URI indicato.

- invalid_state_parameter / state mismatch:
  - Assicurarsi che i cookie siano abilitati nel browser.
  - Se dietro proxy, configurare correttamente le intestazioni X-Forwarded-* e SameSite dei cookie.

- invalid_client / unauthorized_client:
  - Verificare Client ID e Client Secret (variabili d'ambiente corrette e non vuote).
  - Verificare che il client sia di tipo confidential e abbia grant authorization_code abilitato.

- issuer not found / JWK set error / signature validation failed:
  - Controllare che OIDC_ISSUER_URI sia l'issuer corretto del provider.
  - Verificare reachability di .well-known/openid-configuration e jwks_uri dall'ambiente di sviluppo.

- clock_skew / token not yet valid:
  - Sincronizzare l'orologio del sistema (NTP consigliato).

8) Note di sicurezza
- Non committare mai client secret o altri segreti nel VCS.
- Usare variabili d'ambiente, Secret Manager o Vault in ambienti non locali.
- Limitare gli scope al minimo necessario (principio del privilegio minimo).
- Abilitare TLS in tutti gli ambienti non locali; terminare TLS su Ingress/API Gateway con certificati validi.
- Configurare session cookie secure e SameSite adeguati in produzione.

9) Riferimenti al codice (progetto)
- SecurityConfig: src/main/java/com/elite/portal/core/config/SecurityConfig.java
  - Responsabilità: configurare HttpSecurity con oauth2Login(), antMatchers/authorizeHttpRequests, logout, CSRF, e mapping provider/registration company.

- HomeController: src/main/java/com/elite/portal/modules/user/web/HomeController.java
  - Responsabilità: gestire la home page; legge il principal (OidcUser o OAuth2User) e passa al modello attributi come name, email per la visualizzazione.

- Template UI:
  - src/main/resources/templates/home.html (o index.html): mostra il nome utente autenticato nella navbar o nell'header della pagina.

Nota: se i percorsi nel vostro repository differiscono, cercare SecurityConfig e HomeController per confermare la posizione effettiva.

10) Riferimenti utili
- Spring Security OAuth2 Client: https://docs.spring.io/spring-security/reference/servlet/oauth2/login/index.html
- Specifica OpenID Connect: https://openid.net/specs/openid-connect-core-1_0.html

FAQ
D: Posso usare un redirect diverso da company?
R: Sì. Se cambiate il registrationId, aggiornate sia application.yml che il redirect URI sul provider (sostituendo company con il nuovo registrationId) e mantenete la coerenza con {baseUrl}/login/oauth2/code/{registrationId}.

D: Come faccio a cambiare porta in locale?
R: Impostare SERVER_PORT (o server.port in application.properties/yml). Ricordarsi di aggiornare il redirect URI sul provider di conseguenza.
