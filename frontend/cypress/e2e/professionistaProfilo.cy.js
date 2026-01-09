/// <reference types="cypress" />

// Utility per compilare il form con dati validi
const fillValidProfileForm = () => {
  cy.get('[data-testid="input-nome"]').clear().type('Mario');
  cy.get('[data-testid="input-cognome"]').clear().type('Rossi');
  cy.get('[data-testid="input-email"]').clear().type('mario.rossi@example.com');
  cy.get('[data-testid="input-codice-fiscale"]').clear().type('RSSMRA80A01H501U');
  cy.get('[data-testid="input-partita-iva"]').clear().type('12345678901');
  cy.get('[data-testid="input-indirizzo"]').clear().type('Via Roma 1');
  cy.get('[data-testid="input-cap"]').clear().type('20100');
  cy.get('[data-testid="input-citta"]').clear().type('Milano');
  cy.get('[data-testid="input-provincia"]').clear().type('MI');
  cy.get('[data-testid="input-telefono"]').clear().type('+39020000000');
};

// Utility per verificare che i dati nel form corrispondano a quelli attesi
const assertProfileFormValues = (expected) => {
  cy.get('[data-testid="input-nome"]').should('have.value', expected.nome);
  cy.get('[data-testid="input-cognome"]').should('have.value', expected.cognome);
  cy.get('[data-testid="input-email"]').should('have.value', expected.email);
  cy.get('[data-testid="input-codice-fiscale"]').should('have.value', expected.codiceFiscale);
  cy.get('[data-testid="input-partita-iva"]').should('have.value', expected.partitaIva);
  cy.get('[data-testid="input-indirizzo"]').should('have.value', expected.indirizzo);
  cy.get('[data-testid="input-cap"]').should('have.value', expected.cap);
  cy.get('[data-testid="input-citta"]').should('have.value', expected.citta);
  cy.get('[data-testid="input-provincia"]').should('have.value', expected.provincia);
  cy.get('[data-testid="input-telefono"]').should('have.value', expected.telefono);
};

// Nota: si assume che la route /professionista/profilo sia configurata nel router dell'app

describe('Gestione profilo Professionista - E2E', () => {
  beforeEach(() => {
    // Per sicurezza resettiamo lo stato backend via una chiamata diretta
    // Se esiste un endpoint dedicato al reset test, sostituire qui.
    // In mancanza, riavviare l'ambiente tra le esecuzioni dei test.
  });

  it('Accesso alla sezione profilo Professionista dal portale', () => {
    cy.visit('/');

    // Navigazione tramite menu: si assume un link identificabile per i test
    cy.contains('Profilo Professionista').click();

    cy.url().should('include', '/professionista/profilo');
    cy.get('[data-testid="professionista-profilo-page"]').should('be.visible');
  });

  it('Creazione profilo da utente senza profilo: compilazione, salvataggio e verifica persistenza al reload', () => {
    cy.intercept('GET', '/api/professionista/profilo', {
      statusCode: 404,
      body: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profilo professionista non ancora creato.'
      }
    }).as('getProfile');

    cy.visit('/professionista/profilo');

    cy.wait('@getProfile');

    // Il form deve essere visibile e vuoto
    cy.get('[data-testid="profilo-form"]').should('be.visible');
    cy.get('[data-testid="input-nome"]').should('have.value', '');

    fillValidProfileForm();

    cy.intercept('POST', '/api/professionista/profilo', (req) => {
      const body = req.body;
      req.reply({
        statusCode: 201,
        body
      });
    }).as('createProfile');

    cy.get('[data-testid="btn-salva-profilo"]').click();

    cy.wait('@createProfile');

    cy.get('[data-testid="profilo-success-message"]').should('contain.text', 'Profilo creato con successo.');

    // Simuliamo un reload completo pagina
    cy.reload();

    // Questa volta GET deve restituire il profilo creato
    const storedProfile = {
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'mario.rossi@example.com',
      codiceFiscale: 'RSSMRA80A01H501U',
      partitaIva: '12345678901',
      indirizzo: 'Via Roma 1',
      cap: '20100',
      citta: 'Milano',
      provincia: 'MI',
      telefono: '+39020000000'
    };

    cy.intercept('GET', '/api/professionista/profilo', {
      statusCode: 200,
      body: storedProfile
    }).as('getProfileAfterCreate');

    cy.visit('/professionista/profilo');

    cy.wait('@getProfileAfterCreate');

    assertProfileFormValues(storedProfile);
  });

  it('Modifica dei campi anagrafici, contatto e fiscali e verifica della persistenza', () => {
    const existingProfile = {
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'mario.rossi@example.com',
      codiceFiscale: 'RSSMRA80A01H501U',
      partitaIva: '12345678901',
      indirizzo: 'Via Roma 1',
      cap: '20100',
      citta: 'Milano',
      provincia: 'MI',
      telefono: '+39020000000'
    };

    cy.intercept('GET', '/api/professionista/profilo', {
      statusCode: 200,
      body: existingProfile
    }).as('getExistingProfile');

    cy.visit('/professionista/profilo');
    cy.wait('@getExistingProfile');

    assertProfileFormValues(existingProfile);

    // Modifichiamo alcuni campi
    cy.get('[data-testid="input-nome"]').clear().type('Giuseppe');
    cy.get('[data-testid="input-email"]').clear().type('giuseppe.rossi@example.com');
    cy.get('[data-testid="input-telefono"]').clear().type('+390212345678');

    const updatedProfile = {
      ...existingProfile,
      nome: 'Giuseppe',
      email: 'giuseppe.rossi@example.com',
      telefono: '+390212345678'
    };

    cy.intercept('PUT', '/api/professionista/profilo', (req) => {
      const merged = { ...existingProfile, ...req.body };
      req.reply({
        statusCode: 200,
        body: merged
      });
    }).as('updateProfile');

    cy.get('[data-testid="btn-salva-profilo"]').click();
    cy.wait('@updateProfile');

    cy.get('[data-testid="profilo-success-message"]').should('contain.text', 'Profilo aggiornato con successo.');

    // Reload e verifica dati aggiornati
    cy.intercept('GET', '/api/professionista/profilo', {
      statusCode: 200,
      body: updatedProfile
    }).as('getUpdatedProfile');

    cy.visit('/professionista/profilo');
    cy.wait('@getUpdatedProfile');

    assertProfileFormValues(updatedProfile);
  });

  it('Validazioni client-side: blocco salvataggio con dati mancanti o errati e visualizzazione messaggi di errore', () => {
    cy.intercept('GET', '/api/professionista/profilo', {
      statusCode: 404,
      body: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profilo professionista non ancora creato.'
      }
    }).as('getProfileNoProfile');

    cy.visit('/professionista/profilo');
    cy.wait('@getProfileNoProfile');

    // Proviamo a salvare con tutti i campi vuoti
    cy.get('[data-testid="btn-salva-profilo"]').click();

    cy.get('[data-testid="error-nome"]').should('contain.text', 'Il nome è obbligatorio.');
    cy.get('[data-testid="error-cognome"]').should('contain.text', 'Il cognome è obbligatorio.');
    cy.get('[data-testid="error-email"]').should('contain.text', 'Inserire un indirizzo email valido.');
    cy.get('[data-testid="error-codice-fiscale"]').should('contain.text', 'Inserire un codice fiscale valido (16 caratteri).');
    cy.get('[data-testid="error-cap"]').should('contain.text', 'Inserire un CAP valido (5 cifre).');
    cy.get('[data-testid="error-telefono"]').should('contain.text', 'Inserire un numero di telefono valido.');

    // Inseriamo valori errati singolarmente
    cy.get('[data-testid="input-nome"]').type('Mario');
    cy.get('[data-testid="input-cognome"]').type('Rossi');
    cy.get('[data-testid="input-email"]').type('mario.rossi@'); // email non valida
    cy.get('[data-testid="input-codice-fiscale"]').type('ABC'); // CF corto
    cy.get('[data-testid="input-cap"]').type('12'); // CAP corto
    cy.get('[data-testid="input-telefono"]').type('123'); // telefono corto

    cy.get('[data-testid="btn-salva-profilo"]').click();

    cy.get('[data-testid="error-email"]').should('be.visible');
    cy.get('[data-testid="error-codice-fiscale"]').should('be.visible');
    cy.get('[data-testid="error-cap"]').should('be.visible');
    cy.get('[data-testid="error-telefono"]').should('be.visible');

    // Correggiamo con valori validi e verifichiamo che gli errori spariscano
    fillValidProfileForm();
    cy.get('[data-testid="btn-salva-profilo"]').click();

    cy.get('[data-testid^="error-"]').should('not.exist');
  });

  it('Gestione errori di validazione server-side', () => {
    cy.intercept('GET', '/api/professionista/profilo', {
      statusCode: 404,
      body: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profilo professionista non ancora creato.'
      }
    }).as('getProfile');

    cy.visit('/professionista/profilo');
    cy.wait('@getProfile');

    // Compiliamo il form con valori che il server considera non validi
    cy.get('[data-testid="input-nome"]').type('Mario');
    cy.get('[data-testid="input-cognome"]').type('Rossi');
    cy.get('[data-testid="input-email"]').type('mario.rossi@example.com');
    cy.get('[data-testid="input-codice-fiscale"]').type('CFNONVALIDE12345'); // 15 caratteri invece che 16 per forzare errore server
    cy.get('[data-testid="input-cap"]').type('ABCDE'); // non numerico
    cy.get('[data-testid="input-telefono"]').type('+39020000000');

    cy.intercept('POST', '/api/professionista/profilo', {
      statusCode: 400,
      body: {
        code: 'VALIDATION_ERROR',
        message: 'Dati non validi per il profilo professionista.',
        errors: {
          codiceFiscale: 'CF non valido lato server.',
          cap: 'CAP non valido lato server.'
        }
      }
    }).as('createProfileInvalid');

    cy.get('[data-testid="btn-salva-profilo"]').click();
    cy.wait('@createProfileInvalid');

    cy.get('[data-testid="error-codice-fiscale"]').should('contain.text', 'CF non valido lato server.');
    cy.get('[data-testid="error-cap"]').should('contain.text', 'CAP non valido lato server.');
  });

  it('Gestione stati di caricamento e errori API 4xx/5xx con feedback appropriato', () => {
    // Simuliamo un errore 500 al caricamento del profilo
    cy.intercept('GET', '/api/professionista/profilo', {
      statusCode: 500,
      body: {
        code: 'TEST_SIMULATED_500',
        message: 'Errore interno simulato per test.'
      }
    }).as('getProfileError');

    cy.visit('/professionista/profilo');

    cy.get('[data-testid="profilo-loading"]').should('be.visible');

    cy.wait('@getProfileError');

    cy.get('[data-testid="profilo-api-error"]').should('contain.text', 'Errore nel caricamento del profilo');

    // Ora simuliamo errore 500 in salvataggio
    cy.intercept('GET', '/api/professionista/profilo', {
      statusCode: 404,
      body: {
        code: 'PROFILE_NOT_FOUND',
        message: 'Profilo professionista non ancora creato.'
      }
    }).as('getProfileNoProfile');

    cy.visit('/professionista/profilo');
    cy.wait('@getProfileNoProfile');

    fillValidProfileForm();

    cy.intercept('POST', '/api/professionista/profilo', {
      statusCode: 500,
      body: {
        code: 'TEST_SIMULATED_500',
        message: 'Errore interno simulato per test.'
      }
    }).as('createProfileError');

    cy.get('[data-testid="btn-salva-profilo"]').click();
    cy.wait('@createProfileError');

    cy.get('[data-testid="profilo-api-error"]').should('contain.text', 'Si è verificato un errore durante il salvataggio del profilo');
  });
});
