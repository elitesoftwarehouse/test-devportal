# Elite Portal – SSO OIDC (Spring Security)

Questa guida documenta come configurare l'autenticazione Single Sign-On (SSO) tramite OpenID Connect (OIDC) per Elite Portal, in linea con l'Epic "Identità e Accesso (SSO OIDC e RBAC)".

Obiettivo della User Story: l'utente deve potersi autenticare con il provider OIDC aziendale e vedere il proprio nome nella UI.


## Panoramica
- Stack: Java 17, Spring Boot 2.7.x, Spring Security OAuth2 Client, Thymeleaf, Maven.
- Flusso: OAuth 2.0 Authorization Code con OIDC.
- Login: reindirizzamento al provider OIDC, callback su `/login/oauth2/code/{registrationId}`.
- Visualizzazione utente: il nome dell'utente (es. claim `name` o `preferred_username`) è disponibile nel controller come `OidcUser` e mostrato nella UI.


## Prerequisiti
- Un provider OIDC valido (es. Keycloak, Azure AD, Auth0, Okta, provider SSO aziendale) con:
  - Issuer URI (es. `https://idp.company.tld/realms/myrealm`)
  - Client ID
  - Client Secret
  - Grant type: Authorization Code
  - Scopes: almeno `openid`, consigliati anche `profile`, `email`


## Variabili d'ambiente richieste
Impostare le seguenti variabili d'ambiente prima di avviare l'applicazione:
- `OIDC_CLIENT_ID`
- `OIDC_CLIENT_SECRET`
- `OIDC_ISSUER_URI`

Esempi di export:
- macOS/Linux (bash/zsh):
  ```bash
  export OIDC_CLIENT_ID="your-client-id"
  export OIDC_CLIENT_SECRET="your-client-secret"
  export OIDC_ISSUER_URI="https://idp.company.tld/realms/myrealm"
  ```
- Windows (PowerShell):
  ```powershell
  setx OIDC_CLIENT_ID "your-client-id"
  setx OIDC_CLIENT_SECRET "your-client-secret"
  setx OIDC_ISSUER_URI "https://idp.company.tld/realms/myrealm"
  ```


## Configurazione Spring Security OAuth2 Client
Aggiungere/validare in `application.yml` (o profilo `application-local.yml`) la seguente configurazione, che legge dai valori d'ambiente:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          company:
            client-id: ${OIDC_CLIENT_ID}
            client-secret: ${OIDC_CLIENT_SECRET}
            provider: company
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
            scope:
              - openid
              - profile
              - email
        provider:
          company:
            issuer-uri: ${OIDC_ISSUER_URI}
server:
  port: 8080
```

Note:
- Il `registrationId` scelto è `company`. Assicurarsi che sia coerente ovunque (login URL, redirect e provider configuration).
- `issuer-uri` fa sì che Spring scopra automaticamente gli endpoint OIDC (`authorization_endpoint`, `token_endpoint`, `userinfo_endpoint`, `jwks_uri`).


## Redirect URI da configurare sul provider
Nel pannello del provider OIDC, registrare il redirect/callback URI esatto:

- `http://localhost:8080/login/oauth2/code/company`

Opzionale ma consigliato (se supportato):
- Post Logout Redirect URI: `http://localhost:8080/`


## Avvio in locale
1) Verificare di aver impostato le variabili d'ambiente (vedi sezione dedicata).
2) Avviare l'applicazione:
   ```bash
   mvn spring-boot:run
   ```
   oppure specificando un profilo, se previsto:
   ```bash
   mvn -Dspring-boot.run.profiles=local spring-boot:run
   ```
3) Aprire il browser su `http://localhost:8080` e avviare il login:
   - via pagina di login personalizzata (se presente) oppure
   - direttamente: `http://localhost:8080/oauth2/authorization/company`

Logout:
- Endpoint standard Spring Security: `POST /logout` (o `GET /logout` se abilitato). Se configurato l'End Session Endpoint del provider, verrà eseguito il logout federato.


## Verifica della visualizzazione utente
Dopo l'accesso, la UI deve mostrare il nome dell'utente autenticato. A titolo di esempio (Thymeleaf), la `Home` potrebbe renderizzare il nome prelevato da `OidcUser`:
- Controller (riferimento): `HomeController`
- Template (riferimento): `templates/home.html`

Esempio concettuale in un controller Spring:
```java
// Estratto esemplificativo (vedi HomeController nel codice)
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(@AuthenticationPrincipal OidcUser user, Model model) {
        if (user != null) {
            String displayName = user.getFullName() != null ? user.getFullName() : user.getPreferredUsername();
            model.addAttribute("displayName", displayName);
        }
        return "home"; // templates/home.html
    }
}
```

Esempio concettuale in Thymeleaf (`templates/home.html`):
```html
<h5 th:if="${displayName}">Ciao, <span th:text="${displayName}"></span>!</h5>
```


## Troubleshooting (errori comuni)
- Redirect URI mismatch:
  - Errore: il provider segnala che il redirect non corrisponde.
  - Soluzione: assicurarsi che il redirect configurato nel provider sia esattamente `http://localhost:8080/login/oauth2/code/company` e che `registrationId` sia `company`.

- Invalid issuer / Impossibile caricare metadata OIDC:
  - Verificare che `OIDC_ISSUER_URI` punti all'issuer corretto (termina tipicamente con realm/tenant). Deve essere raggiungibile e restituire il discovery document `/.well-known/openid-configuration`.

- Client authentication failed:
  - Controllare `OIDC_CLIENT_ID` e `OIDC_CLIENT_SECRET`. Rigenerare il secret se necessario. Verificare che il client sia abilitato al grant "authorization_code".

- Errore JWKS / Firma token non valida:
  - Verificare la reachability di `jwks_uri` dal server. Assicurarsi che l'orologio del sistema non abbia un offset eccessivo (clock skew) che invalidi i token.

- HTTP vs HTTPS in locale:
  - Alcuni IdP non consentono redirect HTTP. Se richiesto HTTPS anche in locale, usare un proxy locale con TLS o dev tunnel. In produzione, usare sempre TLS (Ingress/Load Balancer con certificati validi).

- Cookie/SameSite:
  - Se il browser blocca i cookie, verificare le policy `SameSite` e third-party cookies. In ambienti con reverse proxy, impostare correttamente `X-Forwarded-*` e `server.forward-headers-strategy`.

- Path/Port errate:
  - Assicurarsi che l'app giri su `http://localhost:8080` o aggiornare di conseguenza la configurazione sul provider.


## Note di sicurezza
- Non committare mai `client-secret` o altri segreti nel repository.
- Usare variabili d'ambiente o un Secret Manager (es. Kubernetes Secrets, AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, Azure Key Vault).
- Limitare gli scope al minimo necessario (`least privilege`).
- Abilitare TLS end-to-end in produzione (Ingress/Api Gateway) e ruotare periodicamente le credenziali.


## Riferimenti nel codice
- Configurazione sicurezza: `SecurityConfig` (es. `com.elite.portal.core.config.SecurityConfig`) dove sono definiti:
  - le regole di autorizzazione,
  - l'abilitazione OIDC/OAuth2 Login,
  - eventuale configurazione logout.
- Controller UI: `HomeController` (es. `com.elite.portal.core.controller.HomeController`) per recuperare l'`OidcUser` e popolare il model con il nome utente.
- Template Thymeleaf: `templates/home.html` (e/o i template coinvolti nella home/dashboard) che mostrano il nome utente autenticato.


## Endpoint utili (sviluppo)
- Avvio login OIDC: `GET /oauth2/authorization/company`
- Callback OIDC: `GET /login/oauth2/code/company`
- Logout: `POST /logout`


## Build
- Esecuzione locale: `mvn spring-boot:run`
- Package: `mvn clean package`

Se riscontri problemi non coperti dalla sezione di troubleshooting, verifica i log applicativi e la configurazione del provider OIDC.
