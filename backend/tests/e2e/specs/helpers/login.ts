import { Page, expect } from '@playwright/test';
import { ExternalOwnerUser } from './testUsers';

// Helper per effettuare il login nel portale Elite come EXTERNAL_OWNER.
// Si assume un form di login con data-testid="login-email", "login-password" e "login-submit".

export async function loginAsExternalOwner(page: Page, user: ExternalOwnerUser) {
  await page.goto('/login');

  await expect(page.getByTestId('login-email')).toBeVisible();

  await page.getByTestId('login-email').fill(user.email);
  await page.getByTestId('login-password').fill(user.password);
  await page.getByTestId('login-submit').click();

  // Attesa generica per il redirect post-login; si può adattare all'URL effettivo.
  await page.waitForURL('**/(dashboard|home|wizard|companies|/)', { timeout: 15000 });
}
