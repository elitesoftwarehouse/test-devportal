import request from 'supertest';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import resourcesRouter from '../src/api/resources/resources.routes';
import { ApiError } from '../src/errors/ApiError';

// Setup app di test minimal
const app: Application = express();
app.use(bodyParser.json());
app.use('/api/resources', resourcesRouter);

// Error handler semplificato per i test
app.use((err: any, _req: any, res: any, _next: any) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }
  return res.status(500).json({ message: 'Errore interno', details: err?.message });
});

jest.mock('../src/database/db', () => {
  const mKnex = jest.fn(() => mKnex);
  (mKnex as any).from = jest.fn(() => mKnex);
  (mKnex as any).leftJoin = jest.fn(() => mKnex);
  (mKnex as any).where = jest.fn(() => mKnex);
  (mKnex as any).whereIn = jest.fn(() => mKnex);
  (mKnex as any).andWhere = jest.fn(() => mKnex);
  (mKnex as any).andWhereIn = jest.fn(() => mKnex);
  (mKnex as any).select = jest.fn(() => mKnex);
  (mKnex as any).countDistinct = jest.fn(() => Promise.resolve([{ count: '0' }]));
  (mKnex as any).orderByRaw = jest.fn(() => mKnex);
  (mKnex as any).limit = jest.fn(() => mKnex);
  (mKnex as any).offset = jest.fn(() => mKnex);
  return { db: mKnex };
});

describe('GET /api/resources/search', () => {
  it('valida i parametri e ritorna 400 per page non valido', async () => {
    const res = await request(app).get('/api/resources/search?page=0');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Parametri di ricerca non validi');
  });

  it('risponde 200 con struttura paginata anche senza filtri', async () => {
    const res = await request(app).get('/api/resources/search');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('pageSize');
    expect(res.body).toHaveProperty('totalItems');
    expect(res.body).toHaveProperty('totalPages');
  });
});
