const request = require('supertest');
const app = require('../src/app');

describe('GET /api/profiles/unified', () => {
  it('restituisce la lista di profili con struttura corretta', async () => {
    const res = await request(app).get('/api/profiles/unified');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('meta');

    if (res.body.data.length > 0) {
      const profile = res.body.data[0];
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('type');
      expect(profile).toHaveProperty('displayName');
      expect(profile).toHaveProperty('quality');
      expect(profile.quality).toHaveProperty('score');
      expect(profile.quality).toHaveProperty('missingFields');
    }
  });

  it('applica correttamente il filtro per tipo', async () => {
    const res = await request(app).get('/api/profiles/unified').query({ type: 'AZIENDA' });
    expect(res.status).toBe(200);
    const { data } = res.body;
    for (const p of data) {
      expect(p.type).toBe('AZIENDA');
    }
  });

  it('applica correttamente il filtro per qualità minima', async () => {
    const res = await request(app).get('/api/profiles/unified').query({ qualityMin: 80 });
    expect(res.status).toBe(200);
    const { data } = res.body;
    for (const p of data) {
      expect(p.quality.score).toBeGreaterThanOrEqual(80);
    }
  });
});
