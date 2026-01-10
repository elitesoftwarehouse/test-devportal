import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { cvRouter } from '../../src/api/cv/CvController';

jest.mock('../../src/services/CvService');

import { CvService } from '../../src/services/CvService';

const CvServiceMock = CvService as jest.MockedClass<typeof CvService>;

describe('Cv API', () => {
  let app: express.Express;
  let serviceInstance: any;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.use('/api', cvRouter);

    serviceInstance = {
      uploadNewCv: jest.fn(),
      listAllHistory: jest.fn(),
      listActiveCvs: jest.fn(),
      deleteCv: jest.fn()
    };

    CvServiceMock.mockImplementation(() => serviceInstance);
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('POST /collaborators/:id/cv con file valido restituisce 201', async () => {
    serviceInstance.uploadNewCv.mockResolvedValue({ id: 1, fileName: 'cv.pdf' });

    const res = await request(app)
      .post('/api/collaborators/1/cv')
      .attach('file', Buffer.from('dummy'), 'cv.pdf');

    expect(res.status).toBe(201);
    expect(serviceInstance.uploadNewCv).toHaveBeenCalled();
    expect(res.body.id).toBe(1);
  });

  it('POST /collaborators/:id/cv senza file restituisce 400 e codice CV_FILE_MISSING', async () => {
    const res = await request(app).post('/api/collaborators/1/cv');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('CV_FILE_MISSING');
  });

  it('POST /collaborators/:id/cv con collaboratore non valido restituisce 400', async () => {
    const res = await request(app)
      .post('/api/collaborators/abc/cv')
      .attach('file', Buffer.from('dummy'), 'cv.pdf');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('CV_COLLABORATOR_INVALID');
  });

  it('POST /collaborators/:id/cv quando il service lancia FILE_INVALID restituisce 400 CV_FILE_INVALID', async () => {
    const error = new Error('FILE_INVALID');
    serviceInstance.uploadNewCv.mockRejectedValue(error);

    const res = await request(app)
      .post('/api/collaborators/1/cv')
      .attach('file', Buffer.from('dummy'), 'cv.pdf');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('CV_FILE_INVALID');
  });

  it('GET /collaborators/:id/cv restituisce 200 con lista CV', async () => {
    serviceInstance.listActiveCvs.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const res = await request(app).get('/api/collaborators/1/cv');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('DELETE /collaborators/:id/cv/:cvId elimina logicamente e restituisce 200', async () => {
    serviceInstance.deleteCv.mockResolvedValue({ id: 1, isDeleted: true });

    const res = await request(app).delete('/api/collaborators/1/cv/1');

    expect(res.status).toBe(200);
    expect(res.body.isDeleted).toBe(true);
  });

  it('DELETE /collaborators/:id/cv/:cvId per CV mancante restituisce 404 CV_NOT_FOUND', async () => {
    serviceInstance.deleteCv.mockResolvedValue(null);

    const res = await request(app).delete('/api/collaborators/1/cv/999');

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('CV_NOT_FOUND');
  });
});
