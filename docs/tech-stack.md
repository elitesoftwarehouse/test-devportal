# Tech Stack - test

**Versione:** 1.0  
**Data:** 16/01/2026  
**Autore:** Architect Agent  

---

## 1. Panoramica Tecnologica

Il progetto “test” adotta uno stack full‑stack JavaScript/TypeScript, con:

- **Frontend** basato su **Next.js (React + TypeScript)** per una UI moderna, SSR/SSG e buona SEO.  
- **Backend** basato su **Node.js + Express in TypeScript**, esposto via API REST.  
- **Database principale** **PostgreSQL** per la gestione dei dati relazionali.  
- **Redis** per caching e gestione di dati volatili.  
- **Containerizzazione Docker** per garantire portabilità, ambienti consistenti e facilità di deployment.

Le scelte tecnologiche sono orientate a: rapidità di sviluppo, stack unificato (TypeScript frontend+backend), facilità di scalabilità orizzontale e integrazione futura con orchestratori (Kubernetes / Cloud Run, ecc.).

> Nota: in assenza di accesso diretto ai file di configurazione (package.json, Dockerfile, ecc.), alcune versioni sono dedotte come “tipiche” per questo tipo di stack e andranno verificate nel repository reale.

---

## 2. Core Platform

| Tecnologia          | Versione (stimata / tipica) | Ruolo        | Razionale |
|---------------------|-----------------------------|--------------|-----------|
| Node.js             | 18.x LTS                    | Runtime BE   | LTS stabile, ottimo supporto TypeScript, performance I/O elevate. |
| TypeScript          | 5.x                         | Linguaggio   | Tipizzazione statica, riduzione errori a runtime, migliore manutenzione. |
| Express             | 4.x                         | Web framework BE | Framework minimale e consolidato per API REST. |
| Next.js             | 14.x                        | Framework FE | SSR/SSG, routing integrato, ottimizzazioni build, ottimo per app “document‑centriche”. |
| React               | 18.x                        | Libreria UI  | Standard de facto per SPA/SSR, ricco ecosistema di componenti. |
| npm / pnpm / yarn   | 8.x / 9.x (npm)             | Gestore dipendenze | Gestione pacchetti, script di build e test. |

---

## 3. Data Layer

| Tecnologia | Versione (tipica) | Ruolo |
|-----------|--------------------|-------|
| PostgreSQL | 14+ / 15+         | Database relazionale principale per utenti, ruoli, progetti, documenti, template, permessi, log generazione. |
| Redis      | 6+ / 7+           | Cache distribuita per metadati, template e risultati di generazione ripetuti. |
| ORM/Query Builder (es. Prisma / TypeORM / Knex)* | n.d. | Accesso dati TypeScript verso PostgreSQL, mapping entità-database, transazioni. |

\* Lo specifico ORM non è identificabile dal solo contesto; l’architettura prevede l’uso di un ORM/Query Builder TS. Andrà verificato nel codice (es.: `prisma.schema`, `typeorm.config.ts`, `knexfile.js`).

Persistono principalmente:

- `USER`, `ROLE`, `USER_ROLE`  
- `PROJECT`, `DOCUMENT`, `DOC_VERSION`  
- `TEMPLATE`, `GENERATED_DOC`  
- `PROJECT_PERMISSION`

---

## 4. Presentation Layer

| Tecnologia              | Versione (tipica) | Ruolo |
|-------------------------|--------------------|-------|
| Next.js                 | 14.x              | Framework full‑stack React con SSR/SSG. |
| React                   | 18.x              | Libreria per componenti UI riutilizzabili. |
| TypeScript              | 5.x              | Tipizzazione lato frontend. |
| CSS Modules / Tailwind CSS / Styled Components* | n.d. | Styling dei componenti (scelta precisa da leggere nel repo). |
| Axios / fetch API*      | n.d.              | Chiamate HTTP verso le API REST del backend. |

\* La scelta tra CSS Modules / Tailwind / Styled Components e tra Axios/fetch deve essere confermata nel codice (`package.json`, cartella `frontend`). L’architettura ammette diverse opzioni.

Responsabilità principali:

- UI per gestione progetti e documenti.
- UI per gestione template di documentazione.
- Schermate per avvio e monitoraggio generazione documenti.
- Gestione autenticazione lato client (storage e refresh JWT).

---

## 5. Application & Domain Layer (Backend)

| Tecnologia            | Versione (tipica) | Ruolo |
|-----------------------|--------------------|-------|
| Node.js               | 18.x LTS          | Runtime server. |
| Express               | 4.x               | Routing REST, middleware, gestione errori. |
| TypeScript            | 5.x               | Servizi applicativi e logica di dominio tipizzata. |
| Libreria validation (es. Zod / Joi / Yup)* | n.d. | Validazione payload request, sicurezza input. |
| Libreria logging (es. pino / winston)*    | n.d. | Logging strutturato e centralizzato. |
| Client Redis ufficiale (`redis`)          | 4.x   | Accesso cache Redis. |

\* La libreria effettiva è da ricavare dal `package.json`.

Servizi implementano:

- Gestione ciclo di vita documenti.
- Organizzazione/indicizzazione contenuti.
- Avvio/gestione job di generazione documentazione.
- Gestione permessi a livello progetto e ruolo.

---

## 6. Security Stack

| Tecnologia / Standard | Versione (tipica) | Ruolo |
|-----------------------|--------------------|-------|
| JWT (JSON Web Token)  | RFC 7519          | Token di autenticazione stateless per le API. |
| Libreria JWT (es. `jsonwebtoken`)* | 9.x | Generazione e verifica JWT (access & refresh token). |
| bcrypt / bcryptjs*    | 5.x / 2.x         | Hash sicuro delle password utente. |
| Middleware Express custom | -            | Autenticazione (estrazione/validazione JWT), autorizzazione RBAC, permessi progetto. |
| HTTPS (terminazione su reverse proxy/CDN) | - | Protezione in transito di tutte le comunicazioni. |

Modello di sicurezza:

- **Autenticazione:** JWT con access token a breve durata e refresh token a durata maggiore.  
- **Autorizzazione:** RBAC (ADMIN, PM, USER) + permessi specifici per progetto (`PROJECT_PERMISSION`).  
- **Protezione dati:** validazione input, sanitizzazione, principle of least privilege lato DB, query parametrizzate (mediate dall’ORM).

---

## 7. External Integrations

Al momento **non emergono** integrazioni obbligatorie verso servizi esterni specifici (come GitHub, OpenAI, ecc.) dal modello architetturale fornito. Il sistema è concepito per lavorare principalmente:

- sui **documenti del progetto** conservati internamente (DB + object storage / filesystem),
- su template configurati dall’utente.

| Servizio / API | Tipo | Scopo | Note |
|----------------|------|-------|------|
| Object Storage / File System | Storage (S3, GCS, o FS locale)* | Conservazione file binari dei documenti e dei documenti generati. | Il tipo concreto non è definito: va verificato (esistenza di client S3, GCS, ecc.). |

Eventuali integrazioni verso:

- sistemi di autenticazione esterni (SSO, OAuth2),
- sistemi di project management (Jira, GitHub, ecc.)
non sono descritte nell’architettura fornita e non vengono quindi inventariate qui.

---

## 8. Infrastructure & Deployment

| Tecnologia / Servizio | Ruolo |
|-----------------------|-------|
| Docker                | Containerizzazione di frontend, backend, PostgreSQL, Redis. |
| Docker Compose        | Orchestrazione locale (ambiente dev). |
| Reverse Proxy / CDN (es. Nginx, CloudFront, ecc.)* | Terminazione TLS, caching statici, instradamento verso backend. |
| Ambienti multipli (dev, staging, prod) | Separazione configurazioni, sicurezza e test prima di prod. |

\* Lo specifico reverse proxy/CDN non è indicato; è una parte generica dell’architettura.

Possibile deployment in:

- piattaforme container (Kubernetes, ECS, Cloud Run, …)  
- con scaling orizzontale del backend Node.js e replica del DB per carichi elevati.

---

## 9. Development, Build & CI/CD Tools

| Tool / Tecnologia | Versione (tipica) | Scopo |
|-------------------|--------------------|-------|
| npm / pnpm / yarn | 8.x / 9.x (npm)   | Gestione dipendenze, script build/test. |
| TypeScript Compiler (`tsc`) | 5.x   | Compilazione TS → JS per backend e frontend (parte server). |
| Next.js build (`next build`) | 14.x | Build ottimizzata del frontend (SSR/SSG, bundling). |
| ESLint*           | 8.x              | Linting del codice JS/TS. |
| Prettier*         | 3.x              | Formattazione consistente del codice. |
| CI Server (es. GitHub Actions / GitLab CI / Jenkins)* | - | Pipeline automatizzate di build, test, build Docker e deploy. |
| Registry container (es. GitHub Container Registry / Docker Hub / ECR)* | - | Storage immagini Docker per deployment. |

\* Strumenti tipici, da confermare nei workflow CI e file di configurazione del repo (`.github/workflows`, `.gitlab-ci.yml`, ecc.).

Pipeline tipica:

1. Lint + test (frontend e backend).  
2. Build Next.js.  
3. Build immagini Docker.  
4. Push al registry.  
5. Deploy automatico su **staging**, con promozione manuale a **produzione**.

---

## 10. Testing Framework

| Tecnologia             | Ruolo |
|------------------------|-------|
| Jest*                  | Testing unitario e, se configurato, integration testing per Node.js/TS e parte di frontend. |
| Testing Library (React Testing Library)* | Test di componenti React a livello di UI. |
| Supertest*             | Test d’integrazione sulle API Express (HTTP level). |
| Tool coverage integrato (Jest / Istanbul)* | Misurazione code coverage. |

\* Tool plausibili per uno stack Node.js + Next.js + Express; le scelte vanno confermate consultando `devDependencies` del `package.json` e la cartella `tests`.

---

## 11. Strategia di Aggiornamento Dipendenze

- **Frequenza aggiornamenti:**  
  - Aggiornamento **minore/patch** per librerie core (Express, Next.js, React, TypeScript, ORM, client Redis, libreria JWT) su base **mensile** o quando sono disponibili fix di sicurezza.  
  - Aggiornamenti **maggiore** pianificati e testati in ambiente **staging** prima del rollout in produzione.

- **Sicurezza e vulnerabilità:**
  - Utilizzo di strumenti come `npm audit` / `pnpm audit` e, se configurato, scanner sicurezza CI (es. Dependabot, Snyk, Renovate) per rilevare vulnerabilità note.  
  - Priorità alta per patch che coinvolgono:
    - autenticazione (JWT, bcrypt),
    - librerie HTTP,
    - ORM/driver DB,
    - framework web (Express, Next.js).

- **Policy di compatibilità:**
  - Blocco delle versioni critiche tramite `package-lock.json` / `pnpm-lock.yaml` per garantire ripetibilità build.  
  - Test automatici (unitari + integrazione base) obbligatori prima di aggiornare una dipendenza di infrastruttura (Next.js, Node.js LTS, ORM, client DB).

---

Se mi fornisci il contenuto dei file `package.json`, `Dockerfile` o eventuali file di configurazione (es. `tsconfig.json`, `docker-compose.yml`), posso aggiornare questo documento con le **versioni esatte** e completare eventuali punti ancora generici (ORM scelto, libreria di logging/validation, strumenti CI effettivamente in uso).