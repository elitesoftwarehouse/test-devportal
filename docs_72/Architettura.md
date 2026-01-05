# Architettura del progetto “test”

Repository: test-devportal  
Branch predefinito: main  
Documentazione: docs_72/Architettura.md (commessaId: 72)

## Introduzione

Questo documento descrive l’architettura di riferimento per l’implementazione del progetto “test”, ospitato nel repository test-devportal. In assenza del documento funzionale allegato, sono riportate assunzioni pragmatiche e linee guida che dovranno essere validate e aggiornate alla disponibilità dei requisiti ufficiali. L’obiettivo è fornire una base solida per lo sviluppo, l’integrazione con i sistemi esistenti (es. Elite Portal), la distribuzione e l’osservabilità.

## Obiettivi e ambito

- Fornire un servizio applicativo “DevPortal” per la consultazione e, ove previsto, la gestione di risorse aziendali (es. progetti, aziende, contatti, timesheet) attraverso API REST.
- Integrare con i servizi di identità di Elite Portal (SSO/OIDC) per autenticazione e autorizzazione.
- Garantire una base infrastrutturale portabile (Docker) e osservabile (log strutturati, metriche, tracer).
- Offrire un front-end opzionale (SPA) per l’accesso umano, oltre a interfacce programmatiche (API).

Nota: i domini funzionali precisi (timesheet, contatti, aziende, progetti) e le operazioni consentite (sola lettura o CRUD) dovranno essere confermati.

## Requisiti (da validare)

- Requisiti funzionali (ipotesi):
  - Autenticazione tramite SSO aziendale (OIDC).
  - Consultazione elenco progetti, aziende, contatti, timesheet.
  - Ricerca e filtri lato API.
  - Possibile sincronizzazione periodica da/verso ERP/Elite Portal (se necessario).
- Requisiti non funzionali:
  - Affidabilità: 99.5% uptime minimo.
  - Sicurezza: OIDC/OAuth2, TLS end-to-end, principle of least privilege.
  - Performance: P95 < 300ms per richieste di lettura su dataset medio.
  - Scalabilità: orizzontale a stateless per il backend; cache condivisa.
  - Osservabilità: log JSON, tracing distribuito, metriche (Prometheus/OpenTelemetry).
  - Portabilità: containerizzazione (Docker).

## Architettura di alto livello

L’architettura proposta è di tipo a micro-servizio singolo (perimetro “DevPortal Service”) con componenti integrativi opzionali (cache, coda):

```mermaid
flowchart LR
  U[Utente/Client SPA] -->|HTTPS| GW[API Gateway / Ingress]
  GW --> API[DevPortal Service (REST API)]
  API -->|OIDC| IDP[Identity Provider (Elite SSO)]
  API --> DB[(PostgreSQL)]
  API --> REDIS[(Redis Cache)]
  API --> EP[Elite Portal API / Sistemi esterni]
  API --> LOG[Log/OTel Collector]
```

- Client: opzionale SPA (React/Vue), o altri client (CLI/integratori).
- API Gateway/Ingress: terminazione TLS, rate limiting, routing.
- DevPortal Service: API REST stateless, business logic, integrazione con Elite Portal.
- Database: PostgreSQL per persistenza applicativa e audit.
- Cache: Redis per risposte frequenti/lookup.
- Elite Portal API: fonte/sink di dati di dominio, integrazione via REST/GraphQL (da confermare).
- Osservabilità: OpenTelemetry Collector, backend log/metriche/traces (es. ELK/Grafana).

## Componenti principali

- Web App (opzionale): SPA che consuma le API. Autenticazione via OIDC (PKCE).
- Backend API: servizio REST, validazione input, mapping domain, orchestrazione integrazioni.
- Connettori verso sistemi esterni: client per Elite Portal API con resilienza (retry/backoff, circuit breaker).
- Storage: PostgreSQL; migrazioni schemi idempotenti.
- Cache: Redis per token di sessione e caching di dataset caldi.
- Job/Scheduler (opzionale): sincronizzazioni periodiche, enrichment dati, cleanup.
- Sicurezza: middleware OIDC, gestione ruoli/scopes, policy ABAC/RBAC.

## Modello dati (proposta)

Schema base per supporto consultazione/indicizzazione locale. Aggiornare in base al dominio definitivo.

```sql
-- projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  customer_id UUID,
  status TEXT CHECK (status IN ('active','archived')) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- companies
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  vat_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- contacts
CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- timesheets (astratto: ore ricondotte a project e utente)
CREATE TABLE timesheets (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  user_id TEXT NOT NULL,
  work_date DATE NOT NULL,
  hours NUMERIC(4,2) NOT NULL CHECK (hours >= 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_code ON projects(code);
CREATE INDEX idx_timesheets_project_date ON timesheets(project_id, work_date);
```

## API REST (bozza OpenAPI)

```yaml
openapi: 3.0.3
info:
  title: DevPortal Service API
  version: 1.0.0
servers:
  - url: https://api.example.com/api/v1
security:
  - oidc: []
components:
  securitySchemes:
    oidc:
      type: openIdConnect
      openIdConnectUrl: https://sso.elite-portal.example.com/.well-known/openid-configuration
paths:
  /projects:
    get:
      summary: Elenco progetti
      parameters:
        - in: query
          name: q
          schema: { type: string }
        - in: query
          name: status
          schema: { type: string, enum: [active, archived] }
        - in: query
          name: limit
          schema: { type: integer, default: 50, minimum: 1, maximum: 200 }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  items:
                    type: array
                    items:
                      $ref: '#/components/schemas/Project'
  /projects/{id}:
    get:
      summary: Dettaglio progetto
      parameters:
        - in: path
          name: id
          required: true
          schema: { type: string, format: uuid }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Project'
        '404': { description: Not Found }
  /companies:
    get:
      summary: Elenco aziende
      responses:
        '200':
          description: OK
  /contacts:
    get:
      summary: Elenco contatti
      responses:
        '200':
          description: OK
  /timesheets:
    get:
      summary: Elenco timesheet
      parameters:
        - in: query
          name: from
          schema: { type: string, format: date }
        - in: query
          name: to
          schema: { type: string, format: date }
      responses:
        '200':
          description: OK
components:
  schemas:
    Project:
      type: object
      properties:
        id: { type: string, format: uuid }
        code: { type: string }
        name: { type: string }
        status: { type: string }
```

Esempi di utilizzo:

```bash
# Elenco progetti
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.example.com/api/v1/projects?status=active&limit=50"

# Dettaglio progetto
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.example.com/api/v1/projects/6a6d7f9e-0b33-4f3e-9a4a-01a2f3c4d5e6"
```

## Flussi principali

- Autenticazione (OIDC Authorization Code + PKCE):
  1. La SPA reindirizza l’utente all’IdP Elite SSO.
  2. Al callback, scambia il code per id_token/access_token.
  3. Il backend valida il JWT (signature, issuer, audience, exp).
  4. Il backend applica RBAC/ABAC su scope/ruoli.

- Consultazione dati:
  1. Client invia richiesta a /api/v1/… con Bearer token.
  2. Backend consulta cache; se miss, interroga DB o integra verso Elite Portal API.
  3. Risposta normalizzata, con etag/cache-control dove opportuno.

- Sincronizzazione (opzionale):
  - Job schedulati che allineano dataset locali attraverso API Elite Portal con chiavi idempotenti e watermark temporali.

## Sicurezza

- Autenticazione: OIDC/OAuth2; validazione JWK dal discovery endpoint.
- Autorizzazione: RBAC basato su ruoli Elite (es. admin, viewer) e scopi (es. projects:read).
- Protezioni:
  - TLS 1.2+ ovunque.
  - Rate limiting/Throttling a livello Ingress.
  - Input validation e sanitizzazione (OWASP ASVS).
  - Segreti gestiti in vault/secret manager; no segreti nel repo.
- Audit:
  - Tracciamento accessi a risorse sensibili con userId, scope, esito.

## Osservabilità

- Logging: JSON strutturato con correlationId/traceId.
- Tracing: OpenTelemetry (SDK nel backend) + Collector.
- Metriche: HTTP latency, error rate, cache hit ratio, DB latency.
- Dashboard: Grafana; alert su SLO (es. P95, 5XX rate).

Esempio log JSON:

```json
{
  "ts": "2026-01-05T10:25:43Z",
  "level": "INFO",
  "service": "devportal-api",
  "traceId": "3f7a2b8e9c1d4a6b",
  "spanId": "ab12cd34ef56",
  "method": "GET",
  "path": "/api/v1/projects",
  "status": 200,
  "duration_ms": 47,
  "user": "u12345",
  "scopes": ["projects:read"]
}
```

## Installazione e configurazione

Prerequisiti:
- Docker + Docker Compose
- Accesso a un IdP OIDC (Elite SSO)
- PostgreSQL e Redis (locali o managed)

Struttura consigliata del repository (da allineare al progetto reale):
```
/
├── docs_72/
│   └── Architettura.md
├── api/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── web/ (opzionale)
│   ├── src/
│   └── Dockerfile
└── deploy/
    ├── docker-compose.yml
    └── k8s/ (manifests opzionali)
```

File .env (esempio):
```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://user:pass@db:5432/devportal
REDIS_URL=redis://redis:6379/0
OIDC_ISSUER=https://sso.elite-portal.example.com
OIDC_AUDIENCE=devportal-api
OIDC_CLIENT_ID=devportal-client
OIDC_CLIENT_SECRET=CHANGE_ME
LOG_LEVEL=info
```

Docker Compose (esempio):

```yaml
version: "3.9"
services:
  api:
    build: ./api
    env_file: .env
    ports:
      - "8080:8080"
    depends_on:
      - db
      - redis
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: devportal
    ports: ["5432:5432"]
    volumes:
      - db_data:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
volumes:
  db_data: {}
```

Migrazioni DB: utilizzare uno strumento (es. Prisma/Flyway/Liquibase). Esempio comandi generici:
```bash
# Esecuzione migrazioni
npm run db:migrate
```

## Esempi backend (Node.js/Express)

Nota: linguaggio e stack da confermare. Esempio indicativo.

```ts
// api/src/server.ts
import express from 'express';
import cors from 'cors';
import { authMiddleware } from './security/oidc';
import { projectsRouter } from './routes/projects';

const app = express();
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

app.use('/api/v1/projects', projectsRouter);

app.listen(process.env.PORT || 8080, () => {
  console.log(`API in ascolto su ${process.env.PORT || 8080}`);
});
```

```ts
// api/src/routes/projects.ts
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../services/db';

export const projectsRouter = Router();

projectsRouter.get('/', async (req, res) => {
  const schema = z.object({
    q: z.string().optional(),
    status: z.enum(['active','archived']).optional(),
    limit: z.coerce.number().min(1).max(200).default(50),
  });
  const { q, status, limit } = schema.parse(req.query);
  const rows = await db.query(
    `SELECT id, code, name, status FROM projects
     WHERE ($1::text IS NULL OR name ILIKE '%'||$1||'%' OR code ILIKE '%'||$1||'%')
       AND ($2::text IS NULL OR status = $2)
     ORDER BY name ASC
     LIMIT $3`, [q ?? null, status ?? null, limit]
  );
  res.json({ items: rows });
});
```

## Utilizzo

- Avvio locale:
```bash
docker compose -f deploy/docker-compose.yml up --build
```

- Test API:
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/v1/projects
```

- Healthcheck:
```bash
curl http://localhost:8080/health
```

## CI/CD

Pipeline (esempio GitHub Actions per Node.js):

```yaml
name: CI
on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: api/package-lock.json
      - name: Install
        run: cd api && npm ci
      - name: Lint
        run: cd api && npm run lint
      - name: Test
        run: cd api && npm test -- --ci
      - name: Build
        run: cd api && npm run build
  docker:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t ghcr.io/org/devportal-api:latest api
      - name: Login & Push
        run: |
          echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
          docker push ghcr.io/org/devportal-api:latest
```

Deployment:
- Ambiente: Kubernetes o Docker Swarm, con Ingress/Nginx, Secret Manager, Horizontal Pod Autoscaler.
- Variabili sensibili in Secret; ConfigMap per configurazioni non sensibili.
- Migrazioni automatizzate in fase di release.

## Test e qualità

- Unit test: business logic e validazione input.
- Integration test: DB, Redis, chiamate a Elite Portal (mock/stub).
- Contract test (Pact) per assicurare compatibilità client-API.
- E2E test (Playwright/Cypress) per la SPA.
- SAST/DAST: scansioni di sicurezza pipeline.
- Coverage target: ≥80% per componenti core.

## Linee guida di sviluppo

- Stile: linting e formattazione automatica.
- Commits: Conventional Commits.
- Branching: GitHub Flow (feature -> PR -> main).
- Code Review: 1+ approvazioni, policy di qualità (lint, test verdi).
- ADR: documentare decisioni architetturali chiave in docs_72/adr/.

Template ADR:

```md
# ADR-XXX: Titolo decisione
Data: YYYY-MM-DD

Contesto
- ...

Decisione
- ...

Conseguenze
- Positive: ...
- Negative: ...
- Mitigazioni: ...
```

## Rischi e mitigazioni

- Requisiti incompleti: utilizzare feature flags e contratti API stabili; iterazioni brevi.
- Dipendenza da sistemi esterni: circuit breaker, retry con backoff, caching.
- Sicurezza: hardening TLS, scansioni regolari, gestione segreti centralizzata.
- Dati personali: privacy by design, minimizzazione, data retention policy.

## Roadmap (indicativa)

- Sprint 1: Setup repo, scaffolding API, OIDC, healthcheck, pipeline CI.
- Sprint 2: Endpoints read-only per projects/companies.
- Sprint 3: timesheets/contacts, cache Redis, metriche/tracing.
- Sprint 4: SPA base, filtri/ricerca, pagination, documentazione OpenAPI completa.
- Sprint 5: Hardening sicurezza, test E2E, readiness per staging/production.

## Note sul repository

- La documentazione è mantenuta in docs_72 in coerenza con commessaId 72.
- Branch predefinito main; adottare PR per tutte le modifiche su Architettura.md.
- Allineare il presente documento al documento funzionale non appena disponibile; marcatori “da validare” devono essere risolti.

## Appendice: Middleware OIDC (esempio semplificato)

```ts
// api/src/security/oidc.ts
import { Request, Response, NextFunction } from 'express';
import jwksRsa from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const jwks = jwksRsa({
  jwksUri: `${process.env.OIDC_ISSUER}/protocol/openid-connect/certs`,
  cache: true,
  rateLimit: true,
});

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing_token' });

  const decoded = jwt.decode(token, { complete: true }) as any;
  const kid = decoded?.header?.kid;
  if (!kid) return res.status(401).json({ error: 'invalid_token_header' });

  const key = await jwks.getSigningKey(kid);
  const publicKey = key.getPublicKey();

  try {
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      audience: process.env.OIDC_AUDIENCE,
      issuer: process.env.OIDC_ISSUER,
    }) as any;
    (req as any).user = { sub: payload.sub, roles: payload.realm_access?.roles ?? [], scope: payload.scope ?? '' };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}
```

---

Questo documento costituisce la base architetturale per “test”. Aggiornare le sezioni contrassegnate come “da validare” sulla base del documento funzionale ufficiale e degli stakeholder tecnici (sicurezza, infrastruttura, prodotto).