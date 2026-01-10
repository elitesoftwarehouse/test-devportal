/// <reference types="cypress" />

/**
 * Test end-to-end del flusso profilo competenze.
 * Copre:
 * - Accesso alla pagina e caricamento dati iniziali
 * - Modifica di ruolo, skills, anni di esperienza e lingua di lavoro
 * - Salvataggio con messaggio di conferma e disabilitazione pulsante
 * - Refresh e verifica persistenza dei dati
 * - Validazioni UI per input non validi
 * - Gestione errori backend
 * - Verifica visibilità aggiornamenti lato IT_OPERATOR con filtri
 */

describe('Flusso profilo competenze - utente standard', () => {
  const baseUrl = Cypress.env('TEST_UI_BASE_URL') || 'http://localhost:3000';
  const apiBase = Cypress.env('TEST_API_BASE_URL') || 'http://localhost:4001/api/test/competence-profile';

  beforeEach(() => {
    // Visita la pagina di test del profilo competenze
    cy.visit(`${baseUrl}/test/competence-profile`);
  });

  it('carica i dati iniziali e mostra il loader', () => {
    cy.get('[data-testid="loader"]').should('exist');

    cy.get('[data-testid="competence-profile-form"]').should('exist');
    cy.get('[data-testid="loader"]').should('not.exist');

    cy.get('[data-testid="role-input"]').should('have.value');
    cy.get('[data-testid="language-select"]').should('not.have.value', '');
  });

  it('consente di modificare e salvare il profilo con conferma e persistenza', () => {
    const newRole = 'Senior Backend Engineer';
    const newSkills = 'Node.js, TypeScript, PostgreSQL';
    const newYears = '8';
    const newLanguage = 'EN';

    cy.get('[data-testid="role-input"]').clear().type(newRole);
    cy.get('[data-testid="skills-input"]').clear().type(newSkills);
    cy.get('[data-testid="years-input"]').clear().type(newYears);
    cy.get('[data-testid="language-select"]').select(newLanguage);

    cy.get('[data-testid="save-button"]').as('saveBtn');

    cy.get('@saveBtn').should('not.be.disabled');
    cy.get('@saveBtn').click();

    cy.get('@saveBtn').should('be.disabled');

    cy.get('[data-testid="success-message"]').should('contain.text', 'Profilo competenze aggiornato con successo.');

    cy.get('@saveBtn').should('not.be.disabled');

    cy.get('[data-testid="role-input"]').should('have.value', newRole);
    cy.get('[data-testid="skills-input"]').should('have.value', newSkills);
    cy.get('[data-testid="years-input"]').should('have.value', newYears);
    cy.get('[data-testid="language-select"]').should('have.value', newLanguage);

    cy.reload();

    cy.get('[data-testid="competence-profile-form"]').should('exist');
    cy.get('[data-testid="role-input"]').should('have.value', newRole);
    cy.get('[data-testid="skills-input"]').should('have.value', newSkills);
    cy.get('[data-testid="years-input"]').should('have.value', newYears);
    cy.get('[data-testid="language-select"]').should('have.value', newLanguage);
  });

  it('mostra messaggi di errore UI per input non validi', () => {
    cy.get('[data-testid="role-input"]').clear();
    cy.get('[data-testid="years-input"]').clear().type('-3');
    cy.get('[data-testid="language-select"]').select('');

    cy.get('[data-testid="save-button"]').click();

    cy.get('[data-testid="role-error"]').should('contain.text', 'Il ruolo è obbligatorio.');
    cy.get('[data-testid="years-error"]').should('contain.text', 'Gli anni di esperienza non possono essere negativi.');
    cy.get('[data-testid="language-error"]').should('contain.text', 'La lingua di lavoro è obbligatoria.');
  });

  it('propaga correttamente gli errori di validazione backend', () => {
    cy.intercept('PUT', `${apiBase}/profile`, (req) => {
      req.reply({
        statusCode: 400,
        body: {
          message: 'Validazione fallita',
          errors: [
            { field: 'role', message: 'Ruolo obbligatorio dal backend.' },
            { field: 'workingLanguage', message: 'Lingua di lavoro mancante dal backend.' }
          ]
        }
      });
    }).as('saveError');

    cy.get('[data-testid="role-input"]').clear().type('Qualunque');
    cy.get('[data-testid="language-select"]').select('IT');

    cy.get('[data-testid="save-button"]').click();

    cy.wait('@saveError');

    cy.get('[data-testid="backend-error"]').should('contain.text', 'Correggere gli errori evidenziati.');
    cy.get('[data-testid="role-error"]').should('contain.text', 'Ruolo obbligatorio dal backend.');
    cy.get('[data-testid="language-error"]').should('contain.text', 'Lingua di lavoro mancante dal backend.');
  });
});


describe('Visibilità e filtri IT_OPERATOR', () => {
  const apiBase = Cypress.env('TEST_API_BASE_URL') || 'http://localhost:4001/api/test/competence-profile';

  it('vede i dati aggiornati e può filtrarli', () => {
    cy.request({
      method: 'PUT',
      url: `${apiBase}/profile`,
      headers: {
        'x-test-user-id': 'standard-user-1',
        'x-test-user-role': 'STANDARD_USER'
      },
      body: {
        role: 'Data Engineer',
        keySkills: ['Python', 'SQL'],
        yearsOfExperience: 4,
        workingLanguage: 'EN'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
    });

    cy.request({
      method: 'GET',
      url: `${apiBase}/admin/profiles`,
      headers: {
        'x-test-user-id': 'operator-1',
        'x-test-user-role': 'IT_OPERATOR'
      },
      qs: {
        role: 'Data Engineer',
        workingLanguage: 'EN',
        minYears: 3,
        maxYears: 5
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      const body = response.body as { total: number; results: any[] };
      expect(body.total).to.be.greaterThan(0);
      const match = body.results.find((r) => r.userId === 'standard-user-1');
      expect(match).to.exist;
      expect(match.role).to.eq('Data Engineer');
      expect(match.workingLanguage).to.eq('EN');
      expect(match.yearsOfExperience).to.eq(4);
    });
  });
});
