const request = require('supertest');
const app = require('../src/app');

describe('Auth endpoints', () => {
  it('dovrebbe rifiutare login con credenziali errate', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'INVALID_CREDENTIALS');
  });

  it('dovrebbe permettere login con utente demo admin e poi accedere a rotta protetta', async () => {
    const agent = request.agent(app);

    const loginRes = await agent
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin1234!' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('user');
    expect(loginRes.body.user).toHaveProperty('email', 'admin@example.com');
    expect(loginRes.body.user.roles).toContain('ADMIN');

    const protectedRes = await agent.get('/api/admin/overview');

    expect(protectedRes.status).toBe(200);
    expect(protectedRes.body).toHaveProperty('user');
    expect(protectedRes.body.user.email).toBe('admin@example.com');
  });

  it('dovrebbe impedire accesso a rotta admin ad utente non autenticato', async () => {
    const res = await request(app).get('/api/admin/overview');
    expect(res.status).toBe(401);
  });

  it('dovrebbe effettuare logout e invalidare la sessione', async () => {
    const agent = request.agent(app);

    const loginRes = await agent
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Admin1234!' });

    expect(loginRes.status).toBe(200);

    const logoutRes = await agent.post('/auth/logout');
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body).toHaveProperty('success', true);

    const protectedRes = await agent.get('/api/admin/overview');
    expect(protectedRes.status).toBe(401);
  });
});
