import bcrypt from 'bcrypt';

import { buildTestUser, TEST_PASSWORD } from '../../helpers/testUsers';

describe('Logica di autenticazione - hashing e confronto password', () => {
  it('genera un hash bcrypt valido e diverso dalla password in chiaro', async () => {
    const user = await buildTestUser('EXTERNAL_OWNER');

    expect(user.passwordHash).toBeDefined();
    expect(user.passwordHash).not.toEqual(TEST_PASSWORD);
    expect(user.passwordHash).toMatch(/^[\$]2[aby]\$.{56}$/);
  });

  it('confronta correttamente la password corretta', async () => {
    const user = await buildTestUser('EXTERNAL_COLLABORATOR');

    const ok = await bcrypt.compare(TEST_PASSWORD, user.passwordHash);
    expect(ok).toBe(true);
  });

  it('rileva correttamente una password errata', async () => {
    const user = await buildTestUser('IT_OPERATOR');

    const ok = await bcrypt.compare('password-non-corretta', user.passwordHash);
    expect(ok).toBe(false);
  });

  it('non espone password in chiaro in eventuali errori', async () => {
    const user = await buildTestUser('SYS_ADMIN');

    let errorMessage = '';
    try {
      await bcrypt.compare(TEST_PASSWORD, 'hash_non_valido');
    } catch (err: any) {
      errorMessage = String(err?.message ?? err);
    }

    expect(errorMessage).not.toContain(TEST_PASSWORD);
    expect(user.passwordHash).not.toContain(TEST_PASSWORD);
  });
});
