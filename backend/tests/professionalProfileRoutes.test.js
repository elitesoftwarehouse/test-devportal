const request = require('supertest');
const app = require('../src/app');
const ProfessionalProfile = require('../src/models/ProfessionalProfile');

jest.mock('../src/models/ProfessionalProfile');

describe('ProfessionalProfile routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('GET /api/professional-profile returns 404 when not found', async () => {
    ProfessionalProfile.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/professional-profile');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Profilo Professionista non presente');
  });

  test('POST /api/professional-profile validates payload', async () => {
    ProfessionalProfile.findOne.mockResolvedValue(null);

    const res = await request(app).post('/api/professional-profile').send({});

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.firstName).toBeDefined();
    expect(res.body.errors.lastName).toBeDefined();
    expect(res.body.errors.email).toBeDefined();
    expect(res.body.errors.fiscalCode).toBeDefined();
  });

  test('POST /api/professional-profile creates profile', async () => {
    ProfessionalProfile.findOne.mockResolvedValue(null);
    ProfessionalProfile.create.mockResolvedValue({ id: 1, userId: 1, firstName: 'Mario', lastName: 'Rossi', email: 'mario.rossi@example.com', fiscalCode: 'RSSMRA80A01H501U' });

    const payload = {
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@example.com',
      fiscalCode: 'RSSMRA80A01H501U',
    };

    const res = await request(app).post('/api/professional-profile').send(payload);

    expect(res.status).toBe(201);
    expect(res.body.firstName).toBe('Mario');
  });
});
