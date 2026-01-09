// Selettori centralizzati per il wizard di primo accreditamento azienda.
// Devono essere allineati con i data-testid e le etichette effettive del front-end.

export const wizardSelectors = {
  container: '[data-testid="company-onboarding-wizard"]',
  startButton: '[data-testid="company-onboarding-start"]',
  // Step indicator
  stepIndicator: '[data-testid="wizard-step-indicator"]',
  // Step 1 - Dati aziendali di base
  step1: {
    container: '[data-testid="wizard-step-1-company-data"]',
    companyName: '[data-testid="field-company-name"]',
    vatNumber: '[data-testid="field-company-vat"]',
    country: '[data-testid="field-company-country"]',
    nextButton: '[data-testid="wizard-next-step-1"]',
  },
  // Step 2 - Indirizzo
  step2: {
    container: '[data-testid="wizard-step-2-address"]',
    address: '[data-testid="field-company-address"]',
    city: '[data-testid="field-company-city"]',
    zip: '[data-testid="field-company-zip"]',
    nextButton: '[data-testid="wizard-next-step-2"]',
    backButton: '[data-testid="wizard-back-step-2"]',
  },
  // Step 3 - Riepilogo e conferma
  step3: {
    container: '[data-testid="wizard-step-3-summary"]',
    termsCheckbox: '[data-testid="field-terms-acceptance"]',
    confirmButton: '[data-testid="wizard-confirm"]',
    backButton: '[data-testid="wizard-back-step-3"]',
  },
  // Errori e validazioni
  validationError: '[data-testid="field-error"]',
  globalError: '[data-testid="wizard-global-error"]',
  // Redirect post-completamento
  companyAreaRoot: '[data-testid="company-dashboard-root"]',
};
