const request = require('supertest');
const { app, initDatabase } = require('../../src/app');

describe('API FornitoriAziende - integrazione', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  function asAdmin() {
    return request(app).set('x-test-user-role', 'admin');
  }

  function asUser() {
    return request(app).set('x-test-user-role', 'user');
  }

  test('flusso CRUD completo con admin', async () => {
    // CREATE
    const createRes = await asAdmin()
      .post('/api/fornitori-aziende')
      .send({
        ragioneSociale: 'Fornitore API',
        partitaIva: '99999999999',
        email: 'api@example.com'
      })
      .expect(201);

    expect(createRes.body.id).toBeDefined();
    expect(createRes.body.ragioneSociale).toBe('Fornitore API');

    const id = createRes.body.id;

    // GET by id
    const getRes = await asAdmin().get(`/api/fornitori-aziende/${id}`).expect(200);
    expect(getRes.body.id).toBe(id);

    // UPDATE
    const updateRes = await asAdmin()
      .put(`/api/fornitori-aziende/${id}`)
      .send({ ragioneSociale: 'Fornitore API MOD' })
      .expect(200);

    expect(updateRes.body.ragioneSociale).toBe('Fornitore API MOD');

    // PATCH stato
    const patchRes = await asAdmin()
      .patch(`/api/fornitori-aziende/${id}/stato`)
      .send({ attivo: false })
      .expect(200);

    expect(patchRes.body.attivo).toBe(false);

    // LIST solo attivi -> non deve contenere il nostro fornitore
    const listAttivi = await asAdmin().get('/api/fornitori-aziende?soloAttivi=true').expect(200);
    expect(Array.isArray(listAttivi.body)).toBe(true);
    const foundInAttivi = listAttivi.body.find((x) => x.id === id);
    expect(foundInAttivi).toBeUndefined();

    // LIST tutti
    const listAll = await asAdmin().get('/api/fornitori-aziende').expect(200);
    const foundInAll = listAll.body.find((x) => x.id === id);
    expect(foundInAll).toBeDefined();

    // DELETE
    await asAdmin().delete(`/api/fornitori-aziende/${id}`).expect(204);

    // GET dopo delete -> 404
    await asAdmin().get(`/api/fornitori-aziende/${id}`).expect(404);
  });

  test('validazione e unicità su API', async () => {
    // dati non validi
    await asAdmin()
      .post('/api/fornitori-aziende')
      .send({ ragioneSociale: '', partitaIva: '' })
      .expect(400);

    // crea valido
    await asAdmin()
      .post('/api/fornitori-aziende')
      .send({ ragioneSociale: 'Test', partitaIva: '12312312312' })
      .expect(201);

    // violazione unicità
    await asAdmin()
      .post('/api/fornitori-aziende')
      .send({ ragioneSociale: 'Altro', partitaIva: '12312312312' })
      .expect(409);
  });

  test('autorizzazione: solo admin può accedere', async () => {
    // Nessun header -> 401
    await request(app)
      .post('/api/fornitori-aziende')
      .send({ ragioneSociale: 'X', partitaIva: '11111111111' })
      .expect(401);

    // Utente non admin -> 403
    await asUser()
      .post('/api/fornitori-aziende')
      .send({ ragioneSociale: 'X', partitaIva: '11111111111' })
      .expect(403);
  });
});
