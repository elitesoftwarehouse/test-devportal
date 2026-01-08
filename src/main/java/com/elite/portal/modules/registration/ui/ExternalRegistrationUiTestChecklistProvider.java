package com.elite.portal.modules.registration.ui;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Provider della checklist di test funzionali UI e cross-browser
 * per la registrazione esterni (professionisti e aziende).
 * <p>
 * Questa classe non contiene logica applicativa, ma definisce
 * in modo strutturato gli scenari di test manuali da eseguire
 * sulla UI di registrazione, in accordo con la user story
 * "Registrazione esterno (professionista o azienda) con creazione account".
 */
public class ExternalRegistrationUiTestChecklistProvider {

    private ExternalRegistrationUiTestChecklistProvider() {
        // utility class
    }

    /**
     * Elenco dei browser desktop target per i test.
     */
    public static List<String> getDesktopTargetBrowsers() {
        List<String> browsers = new ArrayList<String>();
        browsers.add("Google Chrome (ultima versione supportata)");
        browsers.add("Mozilla Firefox (ultima versione supportata)");
        browsers.add("Microsoft Edge (ultima versione supportata)");
        browsers.add("Safari (ultima versione supportata, solo macOS)");
        return Collections.unmodifiableList(browsers);
    }

    /**
     * Elenco dei browser/mobile target per i test.
     */
    public static List<String> getMobileTargetBrowsers() {
        List<String> browsers = new ArrayList<String>();
        browsers.add("Safari iOS (ultima versione supportata)");
        browsers.add("Chrome Android (ultima versione supportata)");
        return Collections.unmodifiableList(browsers);
    }

    /**
     * Lista degli scenari di test principali per la registrazione come professionista.
     */
    public static List<String> getProfessionalRegistrationScenarios() {
        List<String> scenarios = new ArrayList<String>();
        scenarios.add("Registrazione professionista con tutti i dati obbligatori e opzionali valorizzati correttamente");
        scenarios.add("Registrazione professionista con solo campi obbligatori valorizzati");
        scenarios.add("Verifica formattazione e validazione email del professionista");
        scenarios.add("Verifica requisiti password e conferma password per professionista");
        scenarios.add("Verifica campo consenso privacy e condizioni d'uso per professionista");
        scenarios.add("Verifica messaggio di conferma e/o redirect al termine della registrazione professionista");
        scenarios.add("Verifica presenza del riferimento alla possibilità di inviare successivamente una richiesta di accreditamento (professionista)");
        return Collections.unmodifiableList(scenarios);
    }

    /**
     * Lista degli scenari di test principali per la registrazione come azienda.
     */
    public static List<String> getCompanyRegistrationScenarios() {
        List<String> scenarios = new ArrayList<String>();
        scenarios.add("Registrazione azienda con tutti i dati obbligatori e opzionali valorizzati correttamente");
        scenarios.add("Registrazione azienda con solo campi obbligatori valorizzati");
        scenarios.add("Verifica formattazione e validazione email di riferimento aziendale");
        scenarios.add("Verifica requisiti password e conferma password per utente aziendale");
        scenarios.add("Verifica campi anagrafica azienda (ragione sociale, P.IVA/C.F., indirizzo, ecc.)");
        scenarios.add("Verifica campo consenso privacy e condizioni d'uso per azienda");
        scenarios.add("Verifica messaggio di conferma e/o redirect al termine della registrazione azienda");
        scenarios.add("Verifica presenza del riferimento alla possibilità di inviare successivamente una richiesta di accreditamento (azienda)");
        return Collections.unmodifiableList(scenarios);
    }

    /**
     * Lista degli scenari di test relativi agli errori lato client.
     */
    public static List<String> getClientSideErrorScenarios() {
        List<String> scenarios = new ArrayList<String>();
        scenarios.add("Tentativo di invio form con campi obbligatori vuoti");
        scenarios.add("Password e conferma password non coincidenti");
        scenarios.add("Formati errati per email, numeri di telefono e campi numerici");
        scenarios.add("Lunghezze minime/massime non rispettate");
        scenarios.add("Mancato flag dei consensi obbligatori (es. privacy)");
        scenarios.add("Verifica che i messaggi di errore siano chiari, localizzati e posizionati correttamente vicino ai campi");
        scenarios.add("Verifica che il focus venga posizionato sul primo campo in errore");
        scenarios.add("Verifica che la validazione avvenga sia on-blur che on-submit dove previsto");
        return Collections.unmodifiableList(scenarios);
    }

    /**
     * Lista degli scenari di test relativi agli errori lato server.
     */
    public static List<String> getServerSideErrorScenarios() {
        List<String> scenarios = new ArrayList<String>();
        scenarios.add("Registrazione con email già utilizzata (professionista)");
        scenarios.add("Registrazione con email già utilizzata (azienda)");
        scenarios.add("Gestione di errori generici server (es. errore 500) con messaggio user-friendly");
        scenarios.add("Verifica che i messaggi di errore lato server non espongano dettagli tecnici");
        scenarios.add("Verifica ripresentazione dei dati inseriti dall'utente in caso di errore lato server, dove possibile");
        scenarios.add("Verifica allineamento messaggi lato server con le linee guida UX del portale");
        return Collections.unmodifiableList(scenarios);
    }

    /**
     * Lista degli scenari di test relativi a usabilità e accessibilità di base.
     */
    public static List<String> getUsabilityScenarios() {
        List<String> scenarios = new ArrayList<String>();
        scenarios.add("Verifica layout responsive su risoluzioni desktop, tablet e mobile");
        scenarios.add("Verifica leggibilità dei testi e contrasto colori");
        scenarios.add("Verifica dimensione e spaziatura dei controlli touch su mobile");
        scenarios.add("Verifica ordine di tabulazione e navigazione da tastiera");
        scenarios.add("Verifica presenza e chiarezza dei titoli di sezione e label dei campi");
        scenarios.add("Verifica presenza di indicazioni sui campi obbligatori");
        scenarios.add("Verifica che la selezione del tipo di utente (professionista/azienda) sia chiara e modificabile");
        return Collections.unmodifiableList(scenarios);
    }
}
