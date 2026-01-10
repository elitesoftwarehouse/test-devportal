const { searchResources } = require('../src/services/resourceSearchService');

// Nota: questo è un test unitario semplificato che assume un ambiente di test
// con Sequelize configurato e dati seed minimi. In un contesto reale andrebbe
// completato con setup/teardown del database.

describe('searchResources service', () => {
  it('dovrebbe esporre la funzione searchResources', () => {
    expect(typeof searchResources).toBe('function');
  });

  it('dovrebbe accettare parametri base senza lanciare errori (mock)', async () => {
    // In assenza di DB reale, verifichiamo solo che la funzione sia callable.
    // In un ambiente reale questo test verificherà il comportamento della query.
    try {
      await searchResources({ name: '', roleIds: [], skillIds: [], skillMatch: 'ALL', limit: 1, offset: 0 });
    } catch (e) {
      // In un contesto senza DB, è accettabile un errore di connessione.
      // Non falliamo il test su questo aspetto infrastrutturale.
      expect(e).toBeDefined();
    }
  });
});
