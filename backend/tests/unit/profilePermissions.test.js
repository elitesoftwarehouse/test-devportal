import { applyProfilePermissions, canViewProfile } from '../../src/modules/profiles/profilePermissions.js';

describe('profilePermissions', () => {
  describe('applyProfilePermissions', () => {
    const baseProfile = {
      id: 1,
      type: 'PROFESSIONISTA',
      firstName: 'Mario',
      taxCode: 'RSSMRA...',
      salary: 50000,
      internalNotes: 'Nota interna'
    };

    it('non rimuove campi sensibili per ADMIN', () => {
      const filtered = applyProfilePermissions(baseProfile, { role: 'ADMIN', id: 10 });
      expect(filtered.taxCode).toBeDefined();
      expect(filtered.salary).toBeDefined();
      expect(filtered.internalNotes).toBeDefined();
    });

    it('rimuove campi sensibili per USER', () => {
      const filtered = applyProfilePermissions(baseProfile, { role: 'USER', id: 10 });
      expect(filtered.taxCode).toBeUndefined();
      expect(filtered.salary).toBeUndefined();
      expect(filtered.internalNotes).toBeUndefined();
    });
  });

  describe('canViewProfile', () => {
    it('nega accesso se utente assente', () => {
      const allowed = canViewProfile({ type: 'PROFESSIONISTA', userId: 1 }, null);
      expect(allowed).toBe(false);
    });

    it('permette accesso sempre ad ADMIN', () => {
      const allowed = canViewProfile({ type: 'PROFESSIONISTA', userId: 1 }, { role: 'ADMIN', id: 999 });
      expect(allowed).toBe(true);
    });

    it('permette a USER di vedere il proprio profilo professionista', () => {
      const allowed = canViewProfile({ type: 'PROFESSIONISTA', userId: 5 }, { role: 'USER', id: 5 });
      expect(allowed).toBe(true);
    });

    it('impedisce a USER di vedere profili di altri utenti se non della stessa azienda', () => {
      const allowed = canViewProfile(
        { type: 'PROFESSIONISTA', userId: 5, companyId: 1 },
        { role: 'USER', id: 10, companyId: 2 }
      );
      expect(allowed).toBe(false);
    });

    it('permette a USER di vedere collaboratori della stessa azienda', () => {
      const allowed = canViewProfile(
        { type: 'COLLABORATORE', userId: 7, companyId: 3 },
        { role: 'USER', id: 10, companyId: 3 }
      );
      expect(allowed).toBe(true);
    });

    it('permette a USER di vedere solo la propria azienda', () => {
      const allowedOwn = canViewProfile(
        { type: 'AZIENDA', id: 2 },
        { role: 'USER', id: 10, companyId: 2 }
      );
      const allowedOther = canViewProfile(
        { type: 'AZIENDA', id: 3 },
        { role: 'USER', id: 10, companyId: 2 }
      );
      expect(allowedOwn).toBe(true);
      expect(allowedOther).toBe(false);
    });
  });
});
