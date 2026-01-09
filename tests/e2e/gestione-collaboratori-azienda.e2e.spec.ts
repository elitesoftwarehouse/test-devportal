import { test, expect } from '@playwright/test';

async function login(page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/dashboard', { waitUntil: 'networkidle' });
}

const COMPANY_ID = process.env.E2E_COMPANY_ID || '1001';
const collaboratorsPath = `/aziende/${COMPANY_ID}/collaboratori`;

test.describe('Gestione collaboratori azienda – flusso end-to-end Admin', () => {
  test.beforeEach(async ({ page }) => {
    const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.E2E_ADMIN_PASSWORD || 'Password123!';

    await login(page, adminEmail, adminPassword);
  });

  test('creazione, modifica ruolo e disattivazione collaboratore da UI', async ({ page }) => {
    await page.goto(collaboratorsPath);

    await expect(page.getByTestId('company-collaborators-title')).toBeVisible();
    await expect(page.getByTestId('company-collaborators-add-button')).toBeVisible();

    await page.getByTestId('company-collaborators-add-button').click();

    const randomSuffix = Date.now();
    const nome = `Giulia_${randomSuffix}`;
    const cognome = 'Verdi';
    const email = `giulia.verdi+${randomSuffix}@example.com`;

    await page.getByTestId('collaborator-form-firstName').fill(nome);
    await page.getByTestId('collaborator-form-lastName').fill(cognome);
    await page.getByTestId('collaborator-form-email').fill(email);
    await page.getByTestId('collaborator-form-role').selectOption('REFERENTE');
    await page.getByTestId('collaborator-form-submit').click();

    await expect(page.getByTestId('toast-success')).toContainText('Collaboratore creato');

    const row = page.getByTestId('company-collaborators-row').filter({ hasText: nome });
    await expect(row).toBeVisible();
    await expect(row.getByTestId('company-collaborators-row-role')).toHaveText(/Referente/i);
    await expect(row.getByTestId('company-collaborators-row-status')).toHaveText(/Attivo/i);

    await row.getByTestId('company-collaborators-row-edit').click();
    await page.getByTestId('collaborator-form-role').selectOption('SUPPORTO');
    await page.getByTestId('collaborator-form-submit').click();

    await expect(page.getByTestId('toast-success')).toContainText('Collaboratore aggiornato');
    await expect(row.getByTestId('company-collaborators-row-role')).toHaveText(/Supporto/i);

    await row.getByTestId('company-collaborators-row-toggle-active').click();

    await expect(page.getByTestId('toast-success')).toContainText('stato aggiornato');
    await expect(row.getByTestId('company-collaborators-row-status')).toHaveText(/Disattivato/i);
  });
});

test.describe('Gestione collaboratori azienda – permessi utente non amministratore', () => {
  test.beforeEach(async ({ page }) => {
    const userEmail = process.env.E2E_USER_EMAIL || 'user@example.com';
    const userPassword = process.env.E2E_USER_PASSWORD || 'Password123!';

    await login(page, userEmail, userPassword);
  });

  test('un utente non admin vede elenco in sola lettura', async ({ page }) => {
    await page.goto(collaboratorsPath);

    await expect(page.getByTestId('company-collaborators-title')).toBeVisible();
    await expect(page.getByTestId('company-collaborators-add-button')).toHaveCount(0);

    const rows = page.getByTestId('company-collaborators-row');
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      const r = rows.nth(i);
      await expect(r.getByTestId('company-collaborators-row-edit')).toHaveCount(0);
      await expect(r.getByTestId('company-collaborators-row-toggle-active')).toHaveCount(0);
    }
  });
});
