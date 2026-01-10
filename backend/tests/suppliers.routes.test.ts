import request from 'supertest';
import app from '../src/app';
import { getSequelizeInstance } from '../src/sequelize';
import Supplier from '../src/models/Supplier';

describe('Suppliers API', () => {
  beforeAll(async () => {
    const sequelize = await getSequelizeInstance();
    Supplier.initialize(sequelize);
    await sequelize.sync({ force: true });
  });

  it('crea un fornitore', async () => {
    const res = await request(app)
      .post('/api/suppliers')
      .send({
        ragioneSociale: 'Fornitore Test Srl',
        partitaIva: 'IT12345678901',
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.ragioneSociale).toBe('Fornitore Test Srl');
  });

  it('impedisce la creazione senza ragione sociale', async () => {
    const res = await request(app).post('/api/suppliers').send({});
    expect(res.status).toBe(400);
  });

  it('lista i fornitori', async () => {
    const res = await request(app).get('/api/suppliers');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('aggiorna un fornitore', async () => {
    const list = await request(app).get('/api/suppliers');
    const id = list.body[0].id;

    const res = await request(app)
      .put(`/api/suppliers/${id}`)
      .send({ ragioneSociale: 'Fornitore Test Srl Modificato' });

    expect(res.status).toBe(200);
    expect(res.body.ragioneSociale).toBe('Fornitore Test Srl Modificato');
  });

  it('esegue soft delete del fornitore', async () => {
    const list = await request(app).get('/api/suppliers');
    const id = list.body[0].id;

    const delRes = await request(app).delete(`/api/suppliers/${id}`);
    expect(delRes.status).toBe(204);

    const listAfter = await request(app).get('/api/suppliers');
    const exists = listAfter.body.find((x: any) => x.id === id);
    expect(exists).toBeUndefined();
  });
});
