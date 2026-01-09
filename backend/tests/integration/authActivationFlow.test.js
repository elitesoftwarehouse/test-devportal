import request from 'supertest';
import { createApp } from '../../src/server/app.js';
import { pool } from '../../src/server/db.js';

let app;

describe('Flusso registrazione e attivazione utente esterno', () => {
  beforeAll(async () => {
    app = createApp();
    await pool.query('DELETE FROM users');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('attiva correttamente un account con token valido e invalida il token', async () => {
    const registerRes = await request(app)
      .post('/api/auth/external/register')
      .send({
        email: 'integration1@example.com',
        password: 'Password123',
        firstName: 'Mario',
        lastName: 'Rossi',
        role: 'EXTERNAL_OWNER'
      })
      .expect(201);

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', ['integration1@example.com']);
    const user = rows[0];
    expect(user.status).toBe('PENDING_ACTIVATION');
    expect(user.activation_token).toBeDefined();

    const token = user.activation_token;

    const activateRes = await request(app)
      .post('/api/auth/external/activate')
      .send({ token })
      .expect(200);

    expect(activateRes.body.status).toBe('ACTIVE');

    const { rows: rowsAfter } = await pool.query('SELECT * FROM users WHERE email = $1', ['integration1@example.com']);
    const userAfter = rowsAfter[0];
    expect(userAfter.status).toBe('ACTIVE');
    expect(userAfter.activation_token).toBeNull();
    expect(userAfter.activation_token_expiration).toBeNull();
  });

  it('restituisce errore per token inesistente', async () => {
    const res = await request(app)
      .post('/api/auth/external/activate')
      .send({ token: 'non-existent-token' })
      .expect(404);

    expect(res.body.error).toBe('TOKEN_NOT_FOUND');
  });

  it('restituisce errore per token già usato', async () => {
    const email = 'alreadyused@example.com';
    await request(app)
      .post('/api/auth/external/register')
      .send({
        email,
        password: 'Password123',
        firstName: 'Mario',
        lastName: 'Rossi',
        role: 'EXTERNAL_COLLABORATOR'
      })
      .expect(201);

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const token = rows[0].activation_token;

    await request(app).post('/api/auth/external/activate').send({ token }).expect(200);

    const res = await request(app).post('/api/auth/external/activate').send({ token }).expect(410);
    expect(res.body.error).toBe('TOKEN_ALREADY_USED');
  });

  it('restituisce errore per token scaduto', async () => {
    const email = 'expired@example.com';
    await request(app)
      .post('/api/auth/external/register')
      .send({
        email,
        password: 'Password123',
        firstName: 'Mario',
        lastName: 'Rossi',
        role: 'EXTERNAL_OWNER'
      })
      .expect(201);

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = rows[0];

    // Forziamo la scadenza del token a passato
    await pool.query(
      'UPDATE users SET activation_token_expiration = NOW() - INTERVAL \'1 hour\' WHERE id = $1',
      [user.id]
    );

    const res = await request(app)
      .post('/api/auth/external/activate')
      .send({ token: user.activation_token })
      .expect(410);

    expect(res.body.error).toBe('TOKEN_EXPIRED');
  });

  it('impedisce login a utente PENDING_ACTIVATION e permette login dopo attivazione', async () => {
    const email = 'pendinglogin@example.com';
    const password = 'Password123';

    await request(app)
      .post('/api/auth/external/register')
      .send({
        email,
        password,
        firstName: 'Mario',
        lastName: 'Rossi',
        role: 'EXTERNAL_OWNER'
      })
      .expect(201);

    const loginPending = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(403);

    expect(loginPending.body.error).toBe('USER_NOT_ACTIVE');

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const token = rows[0].activation_token;

    await request(app).post('/api/auth/external/activate').send({ token }).expect(200);

    const loginActive = await request(app)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    expect(loginActive.body.status).toBe('ACTIVE');
  });
});
