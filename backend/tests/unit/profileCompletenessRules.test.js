import { calculateProfileCompleteness, COMPLETENESS_LEVEL } from '../../src/modules/profiles/profileCompletenessRules.js';

describe('profileCompletenessRules - calculateProfileCompleteness', () => {
  describe('PROFESSIONISTA', () => {
    it('calcola completezza ALTA per profilo completo', () => {
      const profile = {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        role: 'Developer',
        skills: ['JS', 'React'],
        phone: '123',
        address: 'Via Roma',
        linkedinUrl: 'https://linkedin.com/in/mario'
      };

      const res = calculateProfileCompleteness(profile, 'PROFESSIONISTA');
      expect(res.percentage).toBeGreaterThanOrEqual(80);
      expect(res.level).toBe(COMPLETENESS_LEVEL.HIGH);
      expect(res.missingKeyFields).toEqual([]);
    });

    it('calcola completezza MEDIA per profilo parzialmente completo', () => {
      const profile = {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: '',
        role: null,
        skills: ['JS'],
        phone: null,
        address: null,
        linkedinUrl: null
      };

      const res = calculateProfileCompleteness(profile, 'PROFESSIONISTA');
      expect(res.percentage).toBeGreaterThanOrEqual(50);
      expect(res.percentage).toBeLessThan(80);
      expect(res.level).toBe(COMPLETENESS_LEVEL.MEDIUM);
      expect(res.missingKeyFields).toContain('email');
      expect(res.missingKeyFields).toContain('role');
    });

    it('calcola completezza BASSA per profilo quasi vuoto e restituisce campi obbligatori mancanti', () => {
      const profile = {
        firstName: '',
        lastName: '',
        email: '',
        role: null,
        skills: [],
        phone: null,
        address: null,
        linkedinUrl: null
      };

      const res = calculateProfileCompleteness(profile, 'PROFESSIONISTA');
      expect(res.percentage).toBeLessThan(50);
      expect(res.level).toBe(COMPLETENESS_LEVEL.LOW);
      expect(res.missingKeyFields).toEqual(
        expect.arrayContaining(['firstName', 'lastName', 'email', 'role', 'skills'])
      );
    });

    it('non considera i campi opzionali nella lista missing', () => {
      const profile = {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mr@example.com',
        role: 'Dev',
        skills: ['JS'],
        phone: null,
        address: null,
        linkedinUrl: null
      };

      const res = calculateProfileCompleteness(profile, 'PROFESSIONISTA');
      expect(res.missingKeyFields).not.toContain('phone');
      expect(res.missingKeyFields).not.toContain('address');
      expect(res.missingKeyFields).not.toContain('linkedinUrl');
    });
  });

  describe('AZIENDA', () => {
    it('calcola correttamente i livelli per azienda con soli obbligatori', () => {
      const profile = {
        name: 'ACME',
        vatNumber: 'IT123',
        legalAddress: 'Via Industriale',
        website: null,
        industry: null
      };

      const res = calculateProfileCompleteness(profile, 'AZIENDA');
      // Tutti obbligatori ma nessun opzionale: percentuale alta comunque
      expect(res.level).toBe(COMPLETENESS_LEVEL.HIGH);
      expect(res.missingKeyFields).toEqual([]);
    });

    it('considera gli opzionali nel punteggio ma non nei missing', () => {
      const profile = {
        name: 'ACME',
        vatNumber: 'IT123',
        legalAddress: 'Via Industriale',
        website: null,
        industry: null
      };
      const full = {
        ...profile,
        website: 'https://acme.test',
        industry: 'Software'
      };

      const resBase = calculateProfileCompleteness(profile, 'AZIENDA');
      const resFull = calculateProfileCompleteness(full, 'AZIENDA');

      expect(resFull.percentage).toBeGreaterThan(resBase.percentage);
      expect(resBase.missingKeyFields).toEqual([]);
      expect(resFull.missingKeyFields).toEqual([]);
    });
  });
});
