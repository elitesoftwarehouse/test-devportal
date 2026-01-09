import request from 'supertest';
import { DataSource } from 'typeorm';
import { createApp } from '../../src/app';
import { initDataSource, closeDataSource } from '../../src/utils/dataSource';

let ds: DataSource;
const userId = 'user-int-1';

beforeAll(async () => {
  process.env.DB_PATH = ':memory:';
  ds = await initDataSource();
});

afterAll(async () => {
  await closeDataSource();
});

describe('ProfessionalProfile API - integration', () => {
  test('Scenario creazione primo profilo per utente senza profilo esistente', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/api/professional-profile')
      .set('X-User-Id', userId)
      .send({
        nome: 'Mario',
        cognome: 'Rossi',
        codiceFiscale: 'RSSMRA85M01H501U',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nome).toBe('Mario');
    expect(res.body.cognome).toBe('Rossi');
  });

  test('Scenario lettura profilo esistente', async () => {
    const app = createApp();

    const res = await request(app)
      .get('/api/professional-profile/me')
      .set('X-User-Id', userId)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Mario');
    expect(res.body.cognome).toBe('Rossi');
  });

  test('Scenario aggiornamento dati anagrafici, recapiti e fiscali', async () => {
    const app = createApp();

    const res = await request(app)
      .put('/api/professional-profile')
      .set('X-User-Id', userId)
      .send({
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario.rossi@example.com',
        telefono: '+39 0123 456789',
        partitaIva: '01114601006',
      });

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('mario.rossi@example.com');
    expect(res.body.telefono).toBe('+39 0123 456789');
    expect(res.body.partitaIva).toBe('01114601006');

    // Verifica persistenza corretta rileggendo
    const resGet = await request(app)
      .get('/api/professional-profile/me')
      .set('X-User-Id', userId)
      .send();

    expect(resGet.status).toBe(200);
    expect(resGet.body.email).toBe('mario.rossi@example.com');
    expect(resGet.body.telefono).toBe('+39 0123 456789');
    expect(resGet.body.partitaIva).toBe('01114601006');
  });

  test('Gestione errori: profilo non trovato', async () => {
    const app = createApp();

    const res = await request(app)
      .get('/api/professional-profile/me')
      .set('X-User-Id', 'user-without-profile')
      .send();

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('PROFILE_NOT_FOUND');
  });

  test('Gestione errori: input non valido', async () => {
    const app = createApp();

    const res = await request(app)
      .post('/api/professional-profile')
      .set('X-User-Id', 'user-invalid-input')
      .send({
        nome: 'Mario',
        cognome: 'Rossi',
        codiceFiscale: 'ABC',
      });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(res.body.details).toContain('CODICE_FISCALE_INVALIDO');
  });

  test('Gestione errori: violazioni vincoli DB (profilo duplicato)', async () => {
    const app = createApp();

    const first = await request(app)
      .post('/api/professional-profile')
      .set('X-User-Id', 'user-dup')
      .send({
        nome: 'Mario',
        cognome: 'Rossi',
      });

    expect(first.status).toBe(201);

    const second = await request(app)
      .post('/api/professional-profile')
      .set('X-User-Id', 'user-dup')
      .send({
        nome: 'Mario',
        cognome: 'Rossi',
      });

    expect(second.status).toBe(409);
    expect(second.body.code).toBe('PROFILE_ALREADY_EXISTS');
  });
});
