import request from 'supertest';
import app from '../src/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Company first accreditation routes', () => {
  beforeAll(async () => {
    await prisma.companyOwner.deleteMany();
    await prisma.company.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('POST /api/companies/first-accreditation should require auth', async () => {
    const res = await request(app).post('/api/companies/first-accreditation').send({});
    expect(res.status).toBe(401);
  });

  it('POST /api/companies/first-accreditation should create draft for EXTERNAL_OWNER', async () => {
    const res = await request(app)
      .post('/api/companies/first-accreditation')
      .set('x-mock-user-id', '10')
      .set('x-mock-user-role', 'EXTERNAL_OWNER')
      .send({
        ragioneSociale: 'Route Test Srl',
        partitaIva: 'IT55555555555',
        sedeLegale: {
          indirizzo: 'Via Test 1',
          cap: '00100',
          citta: 'Roma',
          provincia: 'RM'
        },
        email: 'route@test.it'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.statoAccreditamento).toBe('DRAFT');
  });
});
