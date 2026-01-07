# Elite Portal — Setup SSO OIDC (Spring Security)

Questa guida spiega come configurare l'autenticazione Single Sign-On (SSO) con OpenID Connect (OIDC) in Elite Portal.

Obiettivo: consentire agli utenti di autenticarsi tramite provider aziendale OIDC (es. Keycloak, Azure AD, Okta, Google Workspace) e visualizzare il proprio nome nella UI dopo il login.

Tecnologie principali:
- Java 17, Spring Boot 2.7.14, Spring Security (Client OIDC)
- Thymeleaf (SSR) + Bootstrap 5
- Maven


## Panoramica funzionalità SSO OIDC
- Flusso Authorization Code con client confidential.
- Endpoint di login auto-generato da Spring Security: `/oauth2/authorization/company`.
- Callback/Redirect URI gestito da Spring Security: `/login/oauth2/code/company`.
- L'utente autenticato viene esposto come `OidcUser` (o `OAuth2User`) nel SecurityContext e può essere mostrato nella UI (navbar/header/home).
- In locale la comunicazione avviene su http://localhost:8080.


## Prerequisiti
- Un provider OIDC compatibile (OpenID Connect 1.0) con:
  - Issuer URI (es. `https://idp.example.com/realms/company` oppure `https://login.microsoftonline.com/{tenant}/v2.0`)
  - Client ID
  - Client Secret (per client confidential)
- Scopes minimi: `openid`, `profile`, `email` (consigliati per mostrare nome e email).


## Variabili d'ambiente richieste
Impostare le seguenti variabili d'ambiente prima di eseguire l'applicazione:
- `OIDC_CLIENT_ID`
- `OIDC_CLIENT_SECRET`
- `OIDC_ISSUER_URI`

Esempi:

macOS/Linux (bash/zsh):
```bash
export OIDC_CLIENT_ID="your-client-id"
export OIDC_CLIENT_SECRET="your-client-secret"
export OIDC_ISSUER_URI="https://idp.example.com/realms/company"
```

Windows (PowerShell):
```powershell
setx OIDC_CLIENT_ID "your-client-id"
setx OIDC_CLIENT_SECRET "your-client-secret"
setx OIDC_ISSUER_URI "https://idp.example.com/realms/company"
```

Nota: riavviare la shell dopo `setx` su Windows per caricare le variabili.


## Redirect URI da configurare sul provider
Configurare nel provider OIDC l'URI di redirect esatto:

```
http://localhost:8080/login/oauth2/code/company
```

Il `company` è il `registrationId` usato da Spring Security. Deve combaciare sia lato app sia lato provider.


## Configurazione Spring Security OAuth2 Client
Spring Boot 2.7 consente di configurare il client OIDC via `application.yml` utilizzando le variabili d'ambiente.

Esempio di configurazione (application.yml):
```yaml
server:
  port: 8080
  # Se dietro proxy/ingress in ambienti non locali, abilita l'uso delle X-Forwarded-*
  forward-headers-strategy: framework

spring:
  security:
    oauth2:
      client:
        registration:
          company:
            client-id: ${OIDC_CLIENT_ID}
            client-secret: ${OIDC_CLIENT_SECRET}
            scope: openid,profile,email
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
        provider:
          company:
            issuer-uri: ${OIDC_ISSUER_URI}

logging:
  level:
    org.springframework.security: INFO
    org.springframework.security.oauth2: INFO
```

- Avvio login: visitare `/oauth2/authorization/company` (o tramite link nella UI).
- Dopo il successo del login, l'utente viene reindirizzato alla pagina di destinazione (es. home) dove il nome utente è disponibile.


## Avvio in locale
1) Impostare le variabili d'ambiente come indicato sopra.
2) Avviare l'applicazione:

```bash
mvn clean spring-boot:run
```

3) Aprire il browser su:
- Home: `http://localhost:8080/`
- Login OIDC diretto: `http://localhost:8080/oauth2/authorization/company`

Dopo l'autenticazione, l'interfaccia mostrerà il nome dell'utente recuperato dal token OIDC (claim come `name`, `preferred_username` o `email`).


## Come viene mostrato il nome nella UI
- Il controller (vedi riferimenti sotto) espone l'utente corrente nel model o la view lo legge direttamente dal SecurityContext.
- I template Thymeleaf (es. navbar o home) mostrano i claim dell'utente autenticato (ad es. `name` o `preferred_username`).

Suggerimenti:
- Con Thymeleaf Extras Spring Security è possibile usare `sec:authentication`.
- In alternativa, è possibile accedere a `#authentication.principal.attributes['name']` o a un attributo mappato nel model.


## Troubleshooting (errori comuni)
1) Redirect URI mismatch
   - Errore: "Invalid redirect_uri" o "redirect_uri does not match".
   - Causa: l'URI configurato sul provider non corrisponde esattamente a quello dell'app.
   - Soluzione: assicurarsi che sul provider sia impostato esattamente `http://localhost:8080/login/oauth2/code/company`.

2) Invalid issuer / Discovery failed
   - Errore: problemi nella discovery OIDC (JWKs/metadata).
   - Causa: `OIDC_ISSUER_URI` errato o non raggiungibile.
   - Soluzione: verificare l'issuer corretto (deve puntare all'issuer del realm/tenant) e che la rete consenta l'accesso.

3) Invalid client / bad client credentials
   - Causa: `OIDC_CLIENT_ID` o `OIDC_CLIENT_SECRET` non corretti, o client non configurato come confidential.
   - Soluzione: ricontrollare le credenziali e il tipo di client.

4) State mismatch / CSRF
   - Causa: più tab/browser, cookie bloccati o sessione scaduta durante il flusso.
   - Soluzione: chiudere il flusso e riprovare; non bloccare i cookie di terze parti; usare una singola tab.

5) Grant type non supportato
   - Errore: "unsupported_response_type" o simili.
   - Soluzione: abilitare il flusso Authorization Code sul provider.

6) Problemi dietro proxy/ingress (in ambienti non locali)
   - Sintomi: redirect su http anziché https, URL errati.
   - Soluzione: impostare correttamente gli header X-Forwarded-* a livello di proxy/ingress e `server.forward-headers-strategy=framework`.


## Note di sicurezza
- Non committare mai `OIDC_CLIENT_SECRET` o altre credenziali nel repository.
- Preferire variabili d'ambiente e/o un Secret Manager (es. Kubernetes Secrets, Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault).
- Limitare gli scope al minimo necessario (es. `openid`, `profile`, `email`).
- Ruotare periodicamente i secret e usare TLS in ambienti non locali tramite gateway/ingress.
- Evitare di loggare token o PII.


## Riferimenti al codice
- Configurazione di sicurezza: `com.elite.portal.core.config.SecurityConfig`
  - Registra il client OIDC `company`, definisce le regole di accesso e i filtri Spring Security.
- Controller UI: `com.elite.portal.modules.user.web.HomeController`
  - Gestisce la home e popola il model con le informazioni base dell'utente autenticato (quando necessario) per la visualizzazione del nome.
- Template UI (Thymeleaf):
  - `src/main/resources/templates/index.html` o `src/main/resources/templates/home.html`
  - Eventuali frammenti (es. `src/main/resources/templates/fragments/header.html`) per mostrare il nome utente nella navbar.


## Verifica rapida
- Avviare l'app e navigare su `http://localhost:8080/`.
- Cliccare su "Login" (o aprire direttamente `/oauth2/authorization/company`).
- Dopo il login presso il provider OIDC, si viene reindirizzati alla home del portale.
- Verificare che il nome utente sia visibile nella UI (navbar o sezione profilo/home).


## Appendice: esempi di mapping dei claim
- Nome visualizzato: claim `name` (fallback: `preferred_username`, `email`).
- Email: claim `email` (se concesso dal consenso/scope).

Se il provider usa claim personalizzati, adattare il mapping nel template o nel controller.
