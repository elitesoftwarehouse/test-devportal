/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../../src/app');
const { sequelize, getModels } = require('../../src/models');

describe('POST /api/auth/register-external', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('crea un utente esterno in stato PENDING_ACTIVATION', async () => {
    const res = await request(app)
      .post('/api/auth/register-external')
      .send({
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'Password123',
        role: 'EXTERNAL_OWNER',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.email).toBe('mario.rossi@example.com');
    expect(res.body.data.role).toBe('EXTERNAL_OWNER');
    expect(res.body.data.status).toBe('PENDING_ACTIVATION');

    const { User } = getModels();
    const user = await User.findOne({ where: { email: 'mario.rossi@example.com' } });
    expect(user).not.toBeNull();
    expect(user.isActive).toBe(false);
    expect(user.status).toBe('PENDING_ACTIVATION');
    expect(user.activationToken).toBeTruthy();
    expect(user.activationTokenExpiration).toBeInstanceOf(Date);
  });

  it('rifiuta email duplicata', async () => {
    const payload = {
      firstName: 'Luca',
      lastName: 'Verdi',
      email: 'duplicato@example.com',
      password: 'Password123',
      role: 'EXTERNAL_COLLABORATOR',
    };

    await request(app).post('/api/auth/register-external').send(payload);

    const res = await request(app).post('/api/auth/register-external').send(payload);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('valida il ruolo e non permette ruoli interni', async () => {
    const res = await request(app)
      .post('/api/auth/register-external')
      .send({
        firstName: 'Anna',
        lastName: 'Bianchi',
        email: 'anna.bianchi@example.com',
        password: 'Password123',
        role: 'ADMIN',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
