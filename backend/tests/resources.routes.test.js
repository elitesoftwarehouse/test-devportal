const request = require('supertest');
const express = require('express');

const resourcesRouter = require('../src/routes/resources');

jest.mock('../src/services/resourcesService', () => ({
  getResourceDetail: jest.fn(),
  getResourceCvFile: jest.fn()
}));

const resourcesService = require('../src/services/resourcesService');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/resources', resourcesRouter);
  // error handler minimo
  app.use((err, req, res, next) => {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    res.status(500).json({ message: 'Errore interno' });
  });
  return app;
}

describe('Resources routes', () => {
  const app = createApp();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/resources/:id - 404 se risorsa non trovata', async () => {
    resourcesService.getResourceDetail.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/resources/123');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Risorsa non trovata' });
    expect(resourcesService.getResourceDetail).toHaveBeenCalledWith('123');
  });

  test('GET /api/resources/:id - 200 con payload valido', async () => {
    resourcesService.getResourceDetail.mockResolvedValueOnce({
      id: 1,
      fullName: 'Mario Rossi',
      role: 'Developer',
      seniority: 'Senior',
      company: 'Elite',
      status: 'Attivo',
      skills: [],
      cvs: []
    });

    const res = await request(app).get('/api/resources/1');

    expect(res.status).toBe(200);
    expect(res.body.fullName).toBe('Mario Rossi');
  });

  test('GET /api/resources/:id/cv/:cvId/download - 404 se cv non trovato', async () => {
    resourcesService.getResourceCvFile.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/resources/1/cv/99/download');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'CV non trovato per questa risorsa' });
    expect(resourcesService.getResourceCvFile).toHaveBeenCalledWith('1', '99');
  });
});
