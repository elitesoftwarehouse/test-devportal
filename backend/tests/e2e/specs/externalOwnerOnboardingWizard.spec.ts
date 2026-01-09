import { test, expect } from '@playwright/test';
import { loginAsExternalOwner } from './helpers/login';
import { externalOwnerNoCompany, externalOwnerWithCompany } from './helpers/testUsers';
import { wizardSelectors } from '../../../frontend-mirror/wizardSelectors';

// NOTA IMPORTANTE:
// In questo repo fittizio importiamo i selettori da '../../../frontend-mirror/wizardSelectors'.
// Nel progetto reale, assicurarsi che il path punti al file frontend/src/testing/e2e/wizardSelectors.ts
// (ad esempio tramite alias di path TypeScript o copia dei selettori nella cartella backend/tests/e2e).

// Per mantenere questo file self-contained, riportiamo qui un fallback di wizardSelectors
// nel caso l'import esterno non sia disponibile in un contesto isolato.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fallbackWizardSelectors: any = {
  container: '[data-testid="company-onboarding-wizard"]',
  startButton: '[data-testid="company-onboarding-start"]',
  stepIndicator: '[data-testid="wizard-step-indicator"]',
  step1: {
    container: '[data-testid="wizard-step-1-company-data"]',
    companyName: '[data-testid="field-company-name"]',
    vatNumber: '[data-testid="field-company-vat"]',
    country: '[data-testid="field-company-country"]',
    nextButton: '[data-testid="wizard-next-step-1"]',
  },
  step2: {
    container: '[data-testid="wizard-step-2-address"]',
    address: '[data-testid="field-company-address"]',
    city: '[data-testid="field-company-city"]',
    zip: '[data-testid="field-company-zip"]',
    nextButton: '[data-testid="wizard-next-step-2"]',
    backButton: '[data-testid="wizard-back-step-2"]',
  },
  step3: {
    container: '[data-testid="wizard-step-3-summary"]',
    termsCheckbox: '[data-testid="field-terms-acceptance"]',
    confirmButton: '[data-testid="wizard-confirm"]',
    backButton: '[data-testid="wizard-back-step-3"]',
  },
  validationError: '[data-testid="field-error"]',
  globalError: '[data-testid="wizard-global-error"]',
  companyAreaRoot: '[data-testid="company-dashboard-root"]',
};

const selectors = (wizardSelectors || fallbackWizardSelectors) as typeof fallbackWizardSelectors;

// Utility per simulare errori backend (es. partita IVA duplicata) tramite route mocking.
async function mockDuplicateVatBackendError(page) {
  await page.route('**/api/companies/onboarding', async (route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          errorCode: 'COMPANY_VAT_DUPLICATE',
          message: 'Partita IVA già presente a sistema',
        }),
      });
    }
    return route.continue();
  });
}

test.describe('Wizard primo accreditamento EXTERNAL_OWNER', () => {
  test('1) Accesso come EXTERNAL_OWNER senza azienda: apertura automatica o manuale del wizard', async ({ page }) => {
    await loginAsExternalOwner(page, externalOwnerNoCompany);

    // Scenario A: apertura automatica
    const wizardVisible = await page.locator(selectors.container).isVisible().catch(() => false);

    if (!wizardVisible) {
      // Scenario B: apertura manuale da banner o card
      const openButton = page.locator(selectors.startButton);
      await expect(openButton).toBeVisible();
      await openButton.click();
    }

    await expect(page.locator(selectors.container)).toBeVisible();
    await expect(page.locator(selectors.step1.container)).toBeVisible();
  });

  test('2) Compilazione corretta di tutti gli step con salvataggio e conferma finale', async ({ page }) => {
    await loginAsExternalOwner(page, externalOwnerNoCompany);

    const wizardVisible = await page.locator(selectors.container).isVisible().catch(() => false);
    if (!wizardVisible) {
      await page.locator(selectors.startButton).click();
    }

    await expect(page.locator(selectors.step1.container)).toBeVisible();

    // Step 1: dati aziendali
    await page.locator(selectors.step1.companyName).fill('Azienda Test E2E Srl');
    await page.locator(selectors.step1.vatNumber).fill('IT12345678901');
    await page.locator(selectors.step1.country).selectOption('IT');
    await page.locator(selectors.step1.nextButton).click();

    // Step 2: indirizzo
    await expect(page.locator(selectors.step2.container)).toBeVisible();
    await page.locator(selectors.step2.address).fill('Via Roma 1');
    await page.locator(selectors.step2.city).fill('Milano');
    await page.locator(selectors.step2.zip).fill('20100');
    await page.locator(selectors.step2.nextButton).click();

    // Step 3: riepilogo e conferma
    await expect(page.locator(selectors.step3.container)).toBeVisible();
    await page.locator(selectors.step3.termsCheckbox).check();

    await page.locator(selectors.step3.confirmButton).click();

    // Verifica redirect all'area aziendale/dashboard
    await page.waitForURL('**/(companies|company|dashboard|home)**', { timeout: 20000 });
    await expect(page.locator(selectors.companyAreaRoot)).toBeVisible();
  });

  test('3) Validazioni client-side per campi obbligatori e formati', async ({ page }) => {
    await loginAsExternalOwner(page, externalOwnerNoCompany);

    const wizardVisible = await page.locator(selectors.container).isVisible().catch(() => false);
    if (!wizardVisible) {
      await page.locator(selectors.startButton).click();
    }

    // Step 1: prova a procedere senza compilare
    await expect(page.locator(selectors.step1.container)).toBeVisible();
    await page.locator(selectors.step1.nextButton).click();

    const errorsStep1 = page.locator(selectors.validationError);
    await expect(errorsStep1).toHaveCountGreaterThan(0);

    // Inserisco P.IVA in formato errato per validazione formato
    await page.locator(selectors.step1.vatNumber).fill('123');
    await page.locator(selectors.step1.nextButton).click();

    // Controllo che ci sia un messaggio di formato non valido
    const vatError = page.getByText(/partita iva.*formato/i);
    await expect(vatError).toBeVisible();
  });

  test('4) Coerenza tra validazioni client-side ed errori server-side (es. P.IVA duplicata)', async ({ page }) => {
    await loginAsExternalOwner(page, externalOwnerNoCompany);

    const wizardVisible = await page.locator(selectors.container).isVisible().catch(() => false);
    if (!wizardVisible) {
      await page.locator(selectors.startButton).click();
    }

    // Mock dell'errore backend P.IVA duplicata
    await mockDuplicateVatBackendError(page);

    // Compilo step 1 con P.IVA formalmente corretta
    await page.locator(selectors.step1.companyName).fill('Azienda Duplicata Srl');
    await page.locator(selectors.step1.vatNumber).fill('IT99999999999');
    await page.locator(selectors.step1.country).selectOption('IT');
    await page.locator(selectors.step1.nextButton).click();

    // Step 2 - indirizzo corretto
    await expect(page.locator(selectors.step2.container)).toBeVisible();
    await page.locator(selectors.step2.address).fill('Via Test 1');
    await page.locator(selectors.step2.city).fill('Torino');
    await page.locator(selectors.step2.zip).fill('10100');
    await page.locator(selectors.step2.nextButton).click();

    // Step 3 - conferma, provo a inviare
    await expect(page.locator(selectors.step3.container)).toBeVisible();
    await page.locator(selectors.step3.termsCheckbox).check();
    await page.locator(selectors.step3.confirmButton).click();

    // Deve apparire un errore globale coerente con l'errore backend
    const globalError = page.locator(selectors.globalError);
    await expect(globalError).toBeVisible();
    await expect(globalError).toContainText(/partita iva.*già presente/i);
  });

  test('5) Comportamento quando l\'utente ha già un\'azienda accreditata (wizard non mostrato)', async ({ page }) => {
    await loginAsExternalOwner(page, externalOwnerWithCompany);

    // Non deve essere mostrato il wizard
    const wizard = page.locator(selectors.container);
    const isVisible = await wizard.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();

    // L'utente deve essere su un\'area aziendale o dashboard con messaggio adeguato
    await expect(page.locator(selectors.companyAreaRoot)).toBeVisible();
    const correctiveMessage = page.getByText(/azienda già accreditata|hai già un'azienda/i);
    // Se il messaggio è previsto dall'UX, verifichiamo che, se presente, non sia un errore bloccante.
    if (await correctiveMessage.count()) {
      await expect(correctiveMessage.first()).toBeVisible();
    }
  });

  test('6) Responsività di base del wizard (desktop vs mobile/tablet)', async ({ page, browserName }) => {
    await loginAsExternalOwner(page, externalOwnerNoCompany);

    const wizardVisible = await page.locator(selectors.container).isVisible().catch(() => false);
    if (!wizardVisible) {
      await page.locator(selectors.startButton).click();
    }

    await expect(page.locator(selectors.container)).toBeVisible();

    // Verifica semplificata: il wizard deve essere utilizzabile anche con viewport ridotta.
    // La vera responsività viene verificata grazie ai diversi dispositivi configurati in playwright.config.ts.
    const width = page.viewportSize()?.width || 0;

    // Controllo che i pulsanti principali siano visibili e non fuori schermo
    await expect(page.locator(selectors.step1.nextButton)).toBeVisible();

    // Ulteriore check opzionale: su mobile potremmo avere un layout a colonna
    if (width < 768) {
      // Qui ci si potrebbe agganciare a classi CSS specifiche (es. "wizard-mobile").
      // Lasciamo un controllo generico sulla presenza del container.
      await expect(page.locator(selectors.container)).toBeVisible();
    }
  });
});
