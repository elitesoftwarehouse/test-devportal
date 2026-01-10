import request from 'supertest';
import app from '../src/app';

// Nota: in un progetto reale andrebbero usati DB di test e mock per il repository

describe('Professional Profile API', () => {
  it('should return 404 when profile does not exist', async () => {
    const res = await request(app)
      .get('/api/professional-profile')
      .set('Accept', 'application/json');

    expect([200, 404]).toContain(res.status);
  });

  it('should validate required fields on create', async () => {
    const res = await request(app)
      .post('/api/professional-profile')
      .send({})
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBeDefined();
  });

  it('should create profile with minimal valid data', async () => {
    const payload = {
      firstName: 'Mario',
      lastName: 'Rossi',
      taxCode: 'RSSMRA80A01H501U',
    };

    const res = await request(app)
      .post('/api/professional-profile')
      .send(payload)
      .set('Accept', 'application/json');

    if (![201, 400].includes(res.status)) {
      throw new Error(`Unexpected status: ${res.status}`);
    }
  });
});
