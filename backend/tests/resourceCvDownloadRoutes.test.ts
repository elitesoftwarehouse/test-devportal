import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../src/app';
import { db } from '../src/utils/db';

jest.mock('../src/utils/db');
jest.mock('fs');

const mockedDb: any = db;
const mockedFs: any = fs;

describe('GET /api/resources/:id/cvs/:cvId/download', () => {
  const resourceId = 1;
  const cvId = 10;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  function mockAuthAdmin() {
    // Middleware di autenticazione non è definito qui; simuleremo l'utente via header custom
  }

  it('restituisce 400 se gli id non sono numerici', async () => {
    const response = await request(app)
      .get('/api/resources/abc/cvs/xyz/download')
      .set('x-mock-user', JSON.stringify({ id: 1, role: 'ADMIN' }));

    expect(response.status).toBe(400);
  });

  it('restituisce 404 se il CV non è associato alla risorsa', async () => {
    mockedDb.getPool.mockReturnValue({
      query: jest.fn().mockResolvedValue({ rowCount: 0, rows: [] })
    });

    const response = await request(app)
      .get(`/api/resources/${resourceId}/cvs/${cvId}/download`)
      .set('x-mock-user', JSON.stringify({ id: 1, role: 'ADMIN' }));

    expect(response.status).toBe(404);
  });

  it('restituisce 403 se l\'utente non è ADMIN', async () => {
    const response = await request(app)
      .get(`/api/resources/${resourceId}/cvs/${cvId}/download`)
      .set('x-mock-user', JSON.stringify({ id: 2, role: 'USER' }));

    expect(response.status).toBe(403);
  });

  it('effettua lo streaming del file se presente', async () => {
    mockedDb.getPool.mockReturnValue({
      query: jest.fn().mockResolvedValue({
        rowCount: 1,
        rows: [
          {
            id: cvId,
            resourceId,
            storageReference: 'test/cv.pdf',
            fileName: 'cv-test.pdf',
            mimeType: 'application/pdf',
            fileSize: 1234
          }
        ]
      })
    });

    const mockStream: any = {
      pipe: jest.fn().mockImplementation((_res: any) => {}),
      on: jest.fn()
    };

    mockedFs.access = jest.fn((pathArg: any, _mode: any, cb: any) => cb(null));
    mockedFs.createReadStream = jest.fn(() => mockStream);

    const response = await request(app)
      .get(`/api/resources/${resourceId}/cvs/${cvId}/download`)
      .set('x-mock-user', JSON.stringify({ id: 1, role: 'ADMIN' }));

    expect(response.status).toBe(200);
    expect(mockStream.pipe).toHaveBeenCalled();
  });
});
