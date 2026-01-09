/* eslint-disable @typescript-eslint/no-var-requires */
const request = require('supertest');
const app = require('../app');
const { sequelize, Company } = require('../models');

describe('Company accreditation routes', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await Company.create({
      name: 'Test Company',
      legalName: 'Test Company SRL',
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should return accreditation data for existing company', async () => {
    const res = await request(app).get('/api/companies/1/accreditation');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('legalName', 'Test Company SRL');
  });

  it('should update accreditation data for existing company', async () => {
    const payload = {
      vatNumber: 'IT12345678901',
      accreditationStatus: 'ACTIVE',
    };
    const res = await request(app)
      .put('/api/companies/1/accreditation')
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('vatNumber', 'IT12345678901');
    expect(res.body).toHaveProperty('accreditationStatus', 'ACTIVE');
    expect(res.body.firstAccreditationAt).not.toBeNull();
  });

  it('should return 404 for non existing company', async () => {
    const res = await request(app).get('/api/companies/999/accreditation');
    expect(res.status).toBe(404);
  });
});
