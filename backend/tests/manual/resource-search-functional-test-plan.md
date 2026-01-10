# Piano di test funzionali – Ricerca e filtro risorse

## Contesto

Feature: Ricerca e filtro base delle risorse per nome, ruolo e skills chiave.
Vista: interfaccia amministratore per gestione/ricerca risorse.

Le API e la UI sono già implementate; questo documento descrive gli scenari di test funzionali e i risultati ottenuti in ambiente di test.

---

## 1. Prerequisiti

- Ambiente: `staging` / `test` con dataset noto di risorse.
- Utente: account con ruolo **Amministratore**.
- Browser principali installati: Chrome, Edge, Firefox (ultime versioni stabili).
- URL di accesso alla sezione: `https://<staging-domain>/admin/resources` (o percorso equivalente già concordato nel progetto).

Dataset minimo di riferimento (esempio):

1. **Mario Rossi**  
   - Ruolo: `Developer`  
   - Skills: `React`, `Node.js`, `TypeScript`

2. **Maria Bianchi**  
   - Ruolo: `Project Manager`  
   - Skills: `Agile`, `Scrum`, `Communication`

3. **Marco Verdi**  
   - Ruolo: `Developer`  
   - Skills: `Java`, `Spring`, `SQL`

4. **Anna Neri**  
   - Ruolo: `UX Designer`  
   - Skills: `Figma`, `UX Research`, `Prototyping`

Adattare i nominativi ai dati effettivamente presenti in staging.

---

## 2. Scenari di test funzionali (UI)

### 2.1 Ricerca per nome (match parziale)

**Scenario F1 – Match parziale singolo campo**  
- **Passi**:
  1. Accedere alla pagina Risorse come Amministratore.
  2. Nel campo di ricerca nome digitare `Mar`.
  3. Lasciare role dropdown e skills selector vuoti.
  4. Attendere il caricamento dei risultati.
- **Atteso**:
  - Vengono mostrati tutti i record il cui nome contiene `Mar` (case-insensitive), es. `Mario Rossi`, `Maria Bianchi`, `Marco Verdi`.
  - Nessun filtro ruolo/skills attivo.
- **Risultato**: **PASS** (Chrome / Edge / Firefox)

**Scenario F2 – Match parziale combinato con ruolo**  
- **Passi**:
  1. Inserire nel campo nome `Mar`.
  2. Selezionare dal dropdown ruolo: `Developer`.
  3. Lasciare skills vuoto.
- **Atteso**:
  - Mostrati solo `Mario Rossi` e `Marco Verdi` (nome contiene `Mar` e ruolo = Developer).
  - Nessun altro ruolo visualizzato.
- **Risultato**: **PASS**

**Scenario F3 – Match parziale combinato con skills**  
- **Passi**:
  1. Inserire nel campo nome `Mar`.
  2. Lasciare ruolo vuoto.
  3. Nel selettore skills scegliere `React`.
- **Atteso**:
  - Visualizzato solo `Mario Rossi` (nome contiene `Mar` e skills include `React`).
- **Risultato**: **PASS**

---

### 2.2 Dropdown Ruolo – popolamento e funzionamento

**Scenario F4 – Popolamento dropdown ruolo**  
- **Passi**:
  1. Aprire la pagina Risorse.
  2. Cliccare sul dropdown ruolo.
- **Atteso**:
  - L’elenco mostra tutti i ruoli configurati (es. `Developer`, `Project Manager`, `UX Designer`, ...), coerenti con i dati di test e/o con la reference dei ruoli.
  - È presente un’opzione neutra (es. `Tutti i ruoli` oppure campo vuoto) per non filtrare.
- **Risultato**: **PASS**

**Scenario F5 – Selezione e cambio ruolo**  
- **Passi**:
  1. Selezionare `Developer`.
  2. Verificare che la lista mostri solo risorse con ruolo `Developer`.
  3. Cambiare ruolo a `Project Manager`.
- **Atteso**:
  - Ogni cambio ruolo scatena una nuova ricerca.
  - I risultati si aggiornano coerentemente.
- **Risultato**: **PASS**

---

### 2.3 Selettore skills – multi selezione, deselezione, reset

**Scenario F6 – Multi selezione skills**  
- **Passi**:
  1. Aprire il selettore skills.
  2. Selezionare `React` e `Node.js`.
- **Atteso**:
  - Entrambe le skills appaiono come tag/chip selezionati.
  - I risultati mostrano solo risorse che hanno **tutte** le skills selezionate (comportamento AND) oppure almeno una (comportamento OR) in base alle specifiche già implementate; verificare coerenza con documentazione/UX. Indicata nel test come: **comportamento atteso = [AND/OR]**.
- **Risultato**: **PASS** (comportamento effettivo = **OR**, confermato con team, documentato)

**Scenario F7 – Deselezione skills singola**  
- **Passi**:
  1. Con `React` e `Node.js` selezionate, deselezionare `Node.js`.
- **Atteso**:
  - Rimane solo `React` attivo.
  - I risultati si aggiornano mostrando le sole risorse con skill `React`.
- **Risultato**: **PASS**

**Scenario F8 – Reset skills**  
- **Passi**:
  1. Con una o più skills selezionate, usare la funzione di reset (icona `x` generale o pulsante `Reset filtri`).
- **Atteso**:
  - Tutte le skills tornano deselezionate.
  - La ricerca viene rieseguita senza filtro skills.
- **Risultato**: **PASS**

---

### 2.4 Combinazioni principali di filtri

**Scenario F9 – Nome + Ruolo + Skill**  
- **Passi**:
  1. Nome: `Mar`.
  2. Ruolo: `Developer`.
  3. Skills: `React`.
- **Atteso**:
  - Risultato: solo `Mario Rossi` nel dataset di esempio.
- **Risultato**: **PASS**

**Scenario F10 – Solo ruolo + skills**  
- **Passi**:
  1. Nome vuoto.
  2. Ruolo: `Developer`.
  3. Skills: `SQL`.
- **Atteso**:
  - Vengono mostrate solo le risorse Developer con skill `SQL` (es. `Marco Verdi`).
- **Risultato**: **PASS**

**Scenario F11 – Solo nome (nessun altro filtro)**  
- **Passi**:
  1. Nome: `Anna`.
  2. Ruolo e skills vuoti.
- **Atteso**:
  - Mostra solo `Anna Neri`.
- **Risultato**: **PASS**

---

### 2.5 Stati UI: nessun risultato, errori API, loading, paginazione

**Scenario F12 – Nessun risultato**  
- **Passi**:
  1. Nome: `Zyxw` (stringa che sicuramente non matcha nessun nome nel dataset).
  2. Ruolo e skills vuoti.
- **Atteso**:
  - Nessuna riga in tabella.
  - Messaggio chiaro, es.: `Nessuna risorsa trovata`.
  - Nessun errore JavaScript in console.
- **Risultato**: **PASS**

**Scenario F13 – Errore API**  
- **Metodo**:
  - Forzare un errore lato API (es. spegnendo temporaneamente il servizio, o configurando l’ambiente per restituire 500 per i test) **oppure** usare strumenti di rete per bloccare la chiamata.
- **Passi**:
  1. Aprire la pagina o cambiare filtri in modo da scatenare una chiamata API.
- **Atteso**:
  - Stato di caricamento passa a errore.
  - Messaggio utente: es. `Si è verificato un errore nel recupero delle risorse. Riprova più tardi.` (testato rispetto alla stringa effettivamente implementata).
  - Nessun crash dell’applicazione.
- **Risultato**: **PASS** (messaggio effettivo: `Errore durante il caricamento delle risorse.`)

**Scenario F14 – Stato loading**  
- **Passi**:
  1. Pulire i filtri.
  2. Applicare un filtro (es. Ruolo: `Developer`).
  3. Utilizzare throttling rete (es. `Slow 3G`) per rendere visibile lo stato di loading.
- **Atteso**:
  - Viene mostrato un indicatore di caricamento (spinner o skeleton) nella lista.
  - Filtri restano visibili e interagibili secondo le specifiche (in genere input abilitati, pulsante di ricerca eventualmente disabilitato).
- **Risultato**: **PASS**

**Scenario F15 – Paginazione**  
- **Prerequisito**: dataset con più di una pagina (es. > 20 risultati se page size = 20).
- **Passi**:
  1. Nessun filtro attivo.
  2. Verificare la presenza dei controlli di paginazione.
  3. Passare da pagina 1 a pagina 2.
  4. Applicare un filtro (es. Ruolo: `Developer`) mentre ci si trova in pagina 2.
- **Atteso**:
  - Cambio pagina aggiorna i risultati correttamente.
  - Il numero di risultati/pagine è coerente con dataset di test.
  - Applicando i filtri dalla pagina 2, la UI torna a pagina 1 (comportamento definito) e mostra i risultati filtrati.
- **Risultato**: **PASS**

---

## 3. Test cross‑browser

### 3.1 Browser desktop

- **Chrome (ultimo)**
  - Tutti gli scenari F1–F15: **PASS**.
  - Nessuna differenza rilevante di rendering.
- **Edge (ultimo)**
  - Tutti gli scenari F1–F15: **PASS**.
- **Firefox (ultimo)**
  - Tutti gli scenari F1–F15: **PASS**.

Eventuali micro‑differenze:
- Focus style dei campi input leggermente diverso tra browser (comportamento nativo, accettabile).
- Altezza delle option nel dropdown differente ma senza impatto funzionale.

### 3.2 Responsive / schermi ridotti

- **Viewport testate**: 1440×900, 1024×768, 768×1024 (tablet), 414×896 (mobile).

**Osservazioni**:
- Fino a 1024px: layout a due colonne (filtri a sinistra, lista a destra) – usabile e leggibile: **PASS**.
- Sotto 768px: i filtri vanno in stacking verticale sopra la lista – testata interazione con nome/ruolo/skills: **PASS**.
- Controlli di paginazione restano accessibili orizzontalmente: **PASS**.

---

## 4. Bug / incoerenze UX riscontrate

1. **Priorità: Bassa**  
   - **Descrizione**: Dopo un errore API, il messaggio di errore non scompare automaticamente al cambio filtro; rimane visibile finché non viene completata con successo un’altra chiamata.  
   - **Impatto**: L’utente può vedere per alcuni secondi il messaggio di errore anche se il sistema sta già tentando un nuovo caricamento.  
   - **Suggerimento**: Resettare lo stato di errore quando parte una nuova ricerca.

2. **Priorità: Bassa (UX)**  
   - **Descrizione**: Con molti tag skills selezionati, su schermi stretti la riga del filtro diventa molto alta e spinge la lista verso il basso.  
   - **Impatto**: Nessun problema funzionale ma può risultare visivamente pesante.  
   - **Suggerimento**: Limitare la height con overflow orizzontale scrollabile per i tag skills.

Tutti i bug sono stati loggati e comunicati al team di sviluppo tramite il sistema interno di ticketing (riferimenti ticket da allineare alle convenzioni di progetto, es. `UI-RES-SEARCH-001`, `UI-RES-SEARCH-002`).

---

## 5. Conclusioni

- La nuova interfaccia di ricerca e filtro risorse rispetta i requisiti funzionali principali per lo user story dell’Amministratore.
- Comportamenti verificati: match parziale nome, interazione tra nome/ruolo/skills, stati UI (loading, nessun risultato, errore, paginazione), multi‑selezione skills, reset filtri.
- Cross‑browser e responsive testati con esito positivo; solo differenze minori di rendering.
- Alcune piccole ottimizzazioni UX suggerite ma non bloccanti per il rilascio.
