# Elite Portal

Piattaforma di gestione aziendale modulare per timesheet, CRM, progetti, integrazioni esterne e funzionalità AI.

## Indice

- [Requisiti](#requisiti)
- [Configurazione](#configurazione)
- [Build & Run](#build--run)
- [Sicurezza (Resource Server JWT)](#sicurezza-resource-server-jwt)
- [Test](#test)

## Requisiti

- Java 17
- Maven 3.8+
- PostgreSQL 14+

## Configurazione

Le principali variabili di ambiente / proprietà applicative sono:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_PROFILES_ACTIVE`
- `OIDC_ISSUER_URI`

È possibile configurarle tramite variabili di ambiente oppure nel file
`application.yml`/`application.properties` (per ambienti locali).

## Build & Run

```bash
mvn clean install
java -jar target/elite-portal.jar
```

Oppure, in ambiente di sviluppo:

```bash
mvn spring-boot:run
```

## Sicurezza (Resource Server JWT)

L'applicazione espone un set di API REST protette come **Resource Server JWT**
tramite Spring Security OAuth2 Resource Server. L'autenticazione è basata su
un Identity Provider OIDC aziendale che espone un endpoint JWKS per la
validazione delle firme dei token.

### 1. Configurazione `OIDC_ISSUER_URI`

Il Resource Server utilizza l'`issuer` OIDC per:

- recuperare automaticamente la configurazione OpenID Connect (`/.well-known/openid-configuration`)
- caricare la chiave pubblica/JWKS per validare i JWT
- verificare le claim standard (es. `iss`, `aud`, `exp`)

L'URI dell'issuer è configurato tramite la variabile di ambiente:

- **Variabile ambiente:** `OIDC_ISSUER_URI`
- **Proprietà Spring corrispondente:** `spring.security.oauth2.resourceserver.jwt.issuer-uri`

Esempi di configurazione:

**Via variabile di ambiente (consigliato per ambienti non-local):**

```bash
export OIDC_ISSUER_URI="https://login.azienda.it/auth/realms/elite"
```

**Via `application.yml` (solo per sviluppo locale):**

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${OIDC_ISSUER_URI:https://login.azienda.it/auth/realms/elite}
```

In questo modo, in assenza della variabile di ambiente, verrà utilizzato il
valore di default indicato nel placeholder.

> Nota: l'`issuer-uri` deve corrispondere esattamente al campo `iss` presente
> nei token JWT emessi dal provider. In caso contrario, tutte le richieste
> verranno rifiutate con `401 Unauthorized`.

### 2. Mapping delle authorities (claim `scope` / `scp` -> `SCOPE_*`)

Il Resource Server mappa automaticamente le **authorities Spring Security**
a partire dai seguenti claim del token JWT:

- `scope` (stringa con spazi) – formato tipico OAuth2 (`"openid profile api.read"`)
- `scp` (array di stringhe) – formato usato da alcuni IdP (`["api.read", "api.write"]`)

Entrambi i formati vengono normalizzati in authorities con prefisso `SCOPE_`.

Esempi di mapping:

- Claim `scope: "api.read api.write"`
  - Authorities risultanti: `SCOPE_api.read`, `SCOPE_api.write`
- Claim `scp: ["pm.read", "pm.write"]`
  - Authorities risultanti: `SCOPE_pm.read`, `SCOPE_pm.write`

Nella configurazione di sicurezza Spring, tali authorities possono essere
utilizzate per proteggere gli endpoint, ad esempio:

```java
// Esempio indicativo di configurazione (semplificato)
http
    .authorizeHttpRequests()
        .antMatchers("/api/public/**").permitAll()
        .antMatchers("/api/secure/**").hasAuthority("SCOPE_api.read");
```

> Convenzione: **tutti** gli scope esposti dal provider OIDC che si desidera
> utilizzare lato API devono essere definiti e documentati a livello di
> piattaforma. Uno scope tipico per accesso di sola lettura è `viewer`, che
> verrà mappato come `SCOPE_viewer`.

### 3. Pattern endpoint protetti (`/api/public/**`, `/api/secure/**`)

Il portale utilizza una convenzione di base per distinguere gli endpoint REST:

- `GET /api/public/**`
  - endpoint **pubblici** o semi-pubblici
  - non richiedono autenticazione JWT
  - possono esporre metadati, info di health o documentazione

- `/api/secure/**`
  - endpoint **protetti**
  - richiedono sempre un header `Authorization: Bearer <token>` valido
  - la specifica authority richiesta dipende dal singolo endpoint (es.
    `SCOPE_viewer`, `SCOPE_api.read`, `SCOPE_pm.read`, ecc.)

Esempi (indicativi):

- `GET /api/public/health` – accessibile da chiunque
- `GET /api/secure/projects` – richiede utente autenticato con scope adeguato
- `POST /api/secure/projects` – richiede permessi elevati (es. `SCOPE_pm.write`)

### 4. Esempi di richieste con `curl` (Authorization: Bearer `<token>`)

#### 4.1 Chiamata a endpoint pubblico

```bash
curl -i \
  http://localhost:8080/api/public/health
```

Risposta tipica:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"status":"UP"}
```

#### 4.2 Chiamata a endpoint protetto senza token

```bash
curl -i \
  http://localhost:8080/api/secure/projects
```

Risposta tipica:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer
```

#### 4.3 Chiamata a endpoint protetto con token valido

Assumendo di avere un token JWT valido memorizzato in una variabile shell:

```bash
TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."  # token troncato

curl -i \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/secure/projects
```

Se il token è valido e possiede lo scope richiesto, la risposta sarà `200 OK`.

#### 4.4 Chiamata con token valido ma senza scope sufficiente

```bash
curl -i \
  -H "Authorization: Bearer $TOKEN_SENZA_SCOPE" \
  http://localhost:8080/api/secure/projects
```

Se il token non contiene l'authority richiesta (es. manca `SCOPE_pm.read`),
la risposta sarà `403 Forbidden`.

### 5. Differenza tra `401 Unauthorized` e `403 Forbidden`

Nel contesto del Resource Server JWT:

- **`401 Unauthorized` (non autenticato)**
  - Il client **non ha fornito** un token, oppure il token è **inesistente**,
    **malformato**, **scaduto** o **non valido** (firma o issuer non corretti).
  - Spring Security non riesce ad autenticare la richiesta.
  - Il client deve ottenere un nuovo token dall'Identity Provider e riprovare.

- **`403 Forbidden` (non autorizzato)**
  - Il token è **valido** e l'utente è correttamente autenticato.
  - Tuttavia, le authorities (scope) presenti nel token **non sono sufficienti**
    per accedere alla risorsa richiesta.
  - Esempio tipico: endpoint protetto che richiede `SCOPE_pm.write` ma il token
    possiede solo `SCOPE_pm.read`.

Questa distinzione è fondamentale per i client e per il debugging:

- se si riceve `401`, verificare **autenticazione** e validità del token
- se si riceve `403`, verificare gli **scope/ruoli** assegnati all'utente

### 6. Test di integrazione (WireMock + JWKS)

Per garantire il corretto comportamento del Resource Server JWT, il progetto
include **test di integrazione** che simulano il comportamento del provider
OIDC e del suo endpoint JWKS.

#### 6.1 Cosa viene simulato

Nei test di integrazione vengono tipicamente simulati i seguenti aspetti:

1. **Endpoint OIDC discovery**
   - `GET /.well-known/openid-configuration` restituisce una configurazione
     fittizia, inclusi gli URL del `jwks_uri`.

2. **Endpoint JWKS**
   - `GET /jwks` (o percorso equivalente) restituisce una chiave pubblica
     JSON Web Key Set (JWKS) che corrisponde alle chiavi utilizzate nei test
     per firmare i token.

3. **Token JWT firmati**
   - I test generano token JWT di esempio firmati con la chiave privata
     corrispondente al JWKS esposto da WireMock.
   - Vengono generati scenari con token:
     - validi (firma corretta, non scaduti, issuer corrispondente)
     - non validi (firma errata, issuer errato, scaduti)
     - con scope corretti/insufficienti.

4. **Risposte 401/403**
   - I test verificano che le API restituiscano:
     - `401` in caso di token assente/non valido
     - `403` in caso di token valido ma con scope insufficiente.

#### 6.2 Come eseguire i test di integrazione

Per eseguire tutti i test (unit + integrazione):

```bash
mvn clean verify
```

Oppure, solo i test (inclusi quelli di integrazione):

```bash
mvn test
```

I test di integrazione del Resource Server JWT sono implementati come classi
Spring Boot Test che:

- avviano un server **WireMock** embedded sulla porta configurata di test
- impostano `OIDC_ISSUER_URI` (o `spring.security.oauth2.resourceserver.jwt.issuer-uri`)
  puntando al server WireMock
- iniettano client REST (es. `TestRestTemplate` o `WebTestClient`) per inviare
  richieste verso gli endpoint `/api/public/**` e `/api/secure/**`
- generano e allegano token JWT firmati per validare il comportamento del
  Resource Server.

> Nota: i test non dipendono da un vero Identity Provider esterno. Tutte le
> chiamate OIDC/JWKS sono intercettate e servite da WireMock, rendendo la
> suite di test deterministica e ripetibile su qualsiasi ambiente CI.

## Test

Per eseguire l'intera suite di test (unitari + integrazione):

```bash
mvn clean verify
```

Per eseguire solo i test unitari (escludendo eventuali test marcati come IT):

```bash
mvn -DskipITs=false test
```

Verificare la documentazione interna o le convenzioni del progetto per il
naming tra test unitari e test di integrazione (es. suffisso `IT` per le classi
IT).
