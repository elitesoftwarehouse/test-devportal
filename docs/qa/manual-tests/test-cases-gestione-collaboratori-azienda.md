# Test manuali – Gestione collaboratori azienda

## Contesto
Questi casi di test validano il flusso end‑to‑end di gestione dei collaboratori associati alle aziende all’interno di Elite Portal:
- Visualizzazione elenco collaboratori
- Creazione nuovo collaboratore associato
- Modifica ruolo
- Attivazione/disattivazione
- Gestione errori API
- Controllo permessi (solo Amministratori possono creare/modificare)

I test assumono che siano già disponibili:
- API REST per la gestione dei collaboratori aziendali
- UI azienda con tab/section "Collaboratori"
- Ruoli utente: **Amministratore** e **Utente base** (o equivalente)

---

## TC-CO-001 – Visualizzare elenco collaboratori per azienda SENZA collaboratori

**Obiettivo**: Verificare che la UI gestisca correttamente il caso in cui un’azienda non abbia collaboratori associati.

**Pre-condizioni**:
- Esiste un’azienda `Azienda_Senza_Collaboratori` con ID noto (es. `companyId = 1001`)
- Nessun collaboratore associato all’azienda in database
- Utente loggato con ruolo **Amministratore**

**Passi**:
1. Accedere a Elite Portal come utente Amministratore.
2. Navigare nella sezione **Aziende**.
3. Selezionare l’azienda `Azienda_Senza_Collaboratori`.
4. Aprire la tab/section **Collaboratori**.

**Risultato atteso**:
- Viene mostrato un messaggio informativo del tipo: "Nessun collaboratore associato a questa azienda".
- Non vengono mostrate righe nella tabella.
- Il pulsante **Aggiungi collaboratore** è visibile (solo per Amministratore).
- Nessuna azione di modifica/eliminazione è presente (perché non ci sono record).

---

## TC-CO-002 – Visualizzare elenco collaboratori per azienda CON collaboratori

**Obiettivo**: Verificare che l’elenco collaboratori sia visualizzato correttamente quando esistono record.

**Pre-condizioni**:
- Esiste un’azienda `Azienda_Con_Collaboratori` con almeno 2 collaboratori associati in database, ad esempio:
  - Collaboratore 1: `Mario Rossi`, ruolo `Referente`, stato `Attivo`
  - Collaboratore 2: `Luigi Bianchi`, ruolo `Supporto`, stato `Disattivato`
- Utente loggato con ruolo **Amministratore**

**Passi**:
1. Accedere a Elite Portal come Amministratore.
2. Navigare in **Aziende**.
3. Selezionare `Azienda_Con_Collaboratori`.
4. Aprire la tab/section **Collaboratori**.

**Risultato atteso**:
- La tabella mostra almeno 2 righe, una per ciascun collaboratore.
- Per ogni riga sono visibili almeno: Nome, Cognome, Email (se previsto), Ruolo, Stato.
- Per `Mario Rossi` lo stato è indicato come **Attivo** (etichetta/testo/colore coerenti con linee guida).
- Per `Luigi Bianchi` lo stato è indicato come **Disattivato**.
- Per gli Amministratori sono visibili azioni di modifica (es. icona matita) e attivazione/disattivazione.

---

## TC-CO-003 – Creare un nuovo collaboratore associato e verificarlo in elenco

**Obiettivo**: Validare il flusso di creazione di un nuovo collaboratore da UI e la corretta comparsa in elenco.

**Pre-condizioni**:
- Esiste un’azienda `Azienda_Con_Collaboratori`.
- Utente loggato con ruolo **Amministratore**.
- La UI espone un pulsante **Aggiungi collaboratore**.

**Passi**:
1. Accedere ad Elite Portal come Amministratore.
2. Navigare in **Aziende** e selezionare `Azienda_Con_Collaboratori`.
3. Aprire la tab **Collaboratori**.
4. Cliccare su **Aggiungi collaboratore**.
5. Nella form di creazione compilare i campi obbligatori, ad esempio:
   - Nome: `Giulia`
   - Cognome: `Verdi`
   - Email: `giulia.verdi@example.com`
   - Ruolo: selezionare `Referente` (o un ruolo valido)
   - Stato iniziale: `Attivo` (se selezionabile) o usare default.
6. Confermare con **Salva** / **Crea**.

**Risultato atteso**:
- Non vengono mostrati errori di validazione (perché i dati sono corretti).
- La modale/form si chiude (se implementato così).
- Compare una notifica di successo (es. "Collaboratore creato con successo").
- Nell’elenco collaboratori appare una nuova riga con i dati inseriti:
  - Nome `Giulia Verdi`
  - Ruolo `Referente`
  - Stato `Attivo` (o quello selezionato).
- I dati sono consistenti con quanto restituito dall’API (verificabile con strumenti di rete se necessario).

---

## TC-CO-004 – Validazione form creazione collaboratore (errori lato client)

**Obiettivo**: Verificare la validazione lato client (front-end) in caso di dati mancanti o errati.

**Pre-condizioni**:
- Utente Amministratore loggato.
- Accesso alla form di creazione collaboratore.

**Passi**:
1. Aprire la form **Aggiungi collaboratore**.
2. Lasciare vuoti i campi obbligatori (es. Nome, Cognome, Email, Ruolo).
3. Cliccare su **Salva**.

**Risultato atteso**:
- La form non viene inviata all’API.
- Per ogni campo obbligatorio compare un messaggio di errore (es. "Campo obbligatorio").
- I campi sono evidenziati secondo lo stile di errore previsto.

**Passi (scenario email non valida)**:
4. Inserire un’email con formato non valido (es. `giulia@@example`).
5. Cliccare su **Salva**.

**Risultato atteso**:
- Viene mostrato un errore lato client sul campo email (es. "Formato email non valido").
- La richiesta non viene inviata o viene bloccata prima se presente validazione lato client.

---

## TC-CO-005 – Modificare il ruolo di un collaboratore e verificare aggiornamento in tempo reale

**Obiettivo**: Verificare che la modifica del ruolo da UI si propaghi e sia visibile immediatamente in elenco.

**Pre-condizioni**:
- Esiste un collaboratore associato ad `Azienda_Con_Collaboratori`, ad esempio `Mario Rossi` con ruolo `Referente`.
- Utente loggato come **Amministratore**.

**Passi**:
1. Navigare in **Aziende** → `Azienda_Con_Collaboratori` → tab **Collaboratori**.
2. Nella riga di `Mario Rossi`, cliccare sull’azione **Modifica** (modale o inline editing).
3. Cambiare il ruolo da `Referente` a `Supporto` (o un altro ruolo valido).
4. Cliccare su **Salva**.

**Risultato atteso**:
- Non vengono mostrati errori di validazione.
- La form di modifica si chiude.
- La tabella si aggiorna immediatamente mostrando, nella riga di `Mario Rossi`, il nuovo ruolo `Supporto`.
- Non è necessario ricaricare manualmente la pagina.
- Se si verifica la risposta dell’API, il ruolo nel payload di risposta è coerente con quello mostrato in UI.

---

## TC-CO-006 – Attivare/disattivare un collaboratore da UI

**Obiettivo**: Verificare che le azioni di attivazione/disattivazione aggiornino correttamente lo stato e la sua rappresentazione in UI.

**Pre-condizioni**:
- Esiste un collaboratore associato `Luigi Bianchi` con stato `Attivo`.
- Utente loggato come **Amministratore**.

**Passi (Disattivazione)**:
1. Navigare in **Aziende** → `Azienda_Con_Collaboratori` → tab **Collaboratori**.
2. Nella riga di `Luigi Bianchi`, cliccare sull’azione **Disattiva**.
3. Confermare l’azione in eventuale dialog di conferma.

**Risultato atteso**:
- Dopo la conferma, lo stato in tabella passa a `Disattivato`.
- L’eventuale badge/colore è aggiornato (es. grigio/rosso chiaro per disattivato).
- L’icona/azione disponibile può cambiare in **Attiva** (se previsto).

**Passi (Riattivazione)**:
4. Cliccare nuovamente sull’azione **Attiva**.

**Risultato atteso**:
- Lo stato torna a `Attivo` senza bisogno di ricaricare la pagina.
- È mostrata una notifica di successo per entrambe le operazioni.

---

## TC-CO-007 – Gestione errori API: validazione fallita lato server

**Obiettivo**: Assicurarsi che errori di validazione lato server siano mostrati all’utente in modo chiaro.

**Pre-condizioni**:
- Utente Amministratore loggato.
- API configurate per restituire errori con dettaglio (es. HTTP 400 con body contenente messaggi campo-specifici).

**Passi**:
1. Aprire la form **Aggiungi collaboratore**.
2. Inserire dati che provochino un errore di validazione lato server, ad esempio:
   - Email già registrata per quella azienda (se questa regola esiste lato server).
3. Cliccare su **Salva**.

**Risultato atteso**:
- La richiesta viene inviata all’API e questa risponde con un errore di validazione (es. 400).
- La UI intercetta l’errore e mostra:
  - Un messaggio generale (es. "Impossibile salvare il collaboratore, verificare i campi evidenziati").
  - Eventuali errori specifici sui campi (es. "Email già in uso").
- I dati inseriti dall’utente restano in form (non vengono persi).

---

## TC-CO-008 – Gestione errori API: problemi di rete / errore generico server

**Obiettivo**: Verificare messaggi chiari per errori di rete o 5xx.

**Pre-condizioni**:
- Utente Amministratore loggato.
- Possibilità di simulare errore di rete o server (es. usando un ambiente di test con API non raggiungibile o strumenti come devtools / mock).

**Passi**:
1. Navigare alla tab **Collaboratori** di una azienda.
2. Simulare un problema di rete (es. disattivare la rete o configurare il mock per restituire 500).
3. Tentare di creare/modificare un collaboratore oppure ricaricare l’elenco.

**Risultato atteso**:
- La UI mostra un messaggio di errore non tecnico, del tipo:
  - "Si è verificato un problema di connessione. Riprova più tardi." oppure
  - "Impossibile recuperare l’elenco dei collaboratori. Riprova tra qualche minuto."
- Non vengono esposti dettagli tecnici (stack trace, path interno, ecc.).
- La UI rimane utilizzabile (non si blocca completamente); è eventualmente previsto un pulsante **Riprova**.

---

## TC-CO-009 – Verifica permessi: solo Amministratori vedono azioni di creazione/modifica

**Obiettivo**: Verificare che solo gli utenti con ruolo Amministratore possano creare o modificare collaboratori.

### Scenario A – Utente Amministratore

**Pre-condizioni**:
- Utente con ruolo **Amministratore** loggato.

**Passi**:
1. Accedere ad Elite Portal come Amministratore.
2. Navigare in **Aziende** → selezionare un’azienda qualsiasi → tab **Collaboratori**.

**Risultato atteso**:
- È visibile il pulsante **Aggiungi collaboratore**.
- In ogni riga collaboratore sono visibili azioni di **Modifica** e **Attiva/Disattiva**.

### Scenario B – Utente Base (non Amministratore)

**Pre-condizioni**:
- Utente con ruolo **Utente base** / non admin loggato.

**Passi**:
1. Accedere ad Elite Portal con utente non Amministratore.
2. Navigare in **Aziende** → selezionare un’azienda → tab **Collaboratori**.

**Risultato atteso**:
- NON è visibile il pulsante **Aggiungi collaboratore**.
- NON sono visibili azioni di **Modifica** o **Attiva/Disattiva** nelle righe della tabella.
- L’elenco collaboratori è solo in lettura.

---

## TC-CO-010 – Coerenza dati dopo refresh pagina

**Obiettivo**: Verificare che, dopo operazioni di creazione/modifica/attivazione, un refresh della pagina mantenga dati coerenti.

**Pre-condizioni**:
- Sono stati eseguiti i casi TC-CO-003, 004, 005 e 006 con successo.

**Passi**:
1. Dopo aver modificato ruolo o stato di un collaboratore, premere F5 / ricaricare la pagina.
2. Tornare alla tab **Collaboratori** dell’azienda.

**Risultato atteso**:
- L’elenco collaboratori riflette tutte le modifiche effettuate (ruolo aggiornato, stato attivo/disattivo, nuovi collaboratori creati).
- Non ci sono discrepanze rispetto a quanto mostrato prima del refresh.

---

## Registrazione esiti test

Per ogni test case, registrare:
- Data esecuzione
- Ambiente (es: DEV, UAT, PROD)
- Utente / ruolo utilizzato
- Esito: **Pass** / **Fail**
- Note e screenshot in caso di **Fail**
- Eventuale ID ticket bug aperto (Jira, Azure DevOps, ecc.)

Formato suggerito (tabella in Jira / Excel / strumento QA):

| TC ID      | Data       | Ambiente | Ruolo utente  | Esito | Note                         | Bug ID   |
|-----------|------------|----------|---------------|-------|------------------------------|----------|
| TC-CO-001 | 2026-01-09 | DEV      | Amministratore| Pass  | –                            | –        |
| TC-CO-002 | 2026-01-09 | DEV      | Amministratore| Fail  | Stato visualizzato errato    | BUG-1234 |

---

## Bug tracking

In caso di esito **Fail**, aprire un ticket bug includendo:
- Riferimento allo story/feature: *Gestione collaboratori associati alle Aziende: elenco, creazione e associazione con ruolo e stato*
- TC ID che ha fallito
- Passi per riprodurre
- Risultato atteso
- Risultato effettivo
- Screenshot / log di rete (se disponibili)
- Priorità suggerita (es. Alta se blocca flusso principale di gestione collaboratori)
