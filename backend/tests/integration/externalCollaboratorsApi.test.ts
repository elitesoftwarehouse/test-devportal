import request from 'supertest';
import { app } from '../../src/app';
import { Pool } from 'pg';

jest.mock('pg', () => {
  const mClient = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  };
  const mPool = jest.fn(() => mClient);
  return { Pool: mPool };
});

const mockedPoolInstance: any = new (Pool as any)();

describe('External collaborators API', () => {
  beforeEach(() => {
    mockedPoolInstance.query.mockReset();
  });

  describe('POST /api/external-collaborators/invitations', () => {
    it('ritorna 400 per email invalida', async () => {
      const res = await request(app)
        .post('/api/external-collaborators/invitations')
        .send({ email: 'not-an-email' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_EMAIL');
    });
  });

  describe('POST /api/external-collaborators/activation', () => {
    it('ritorna 400 per payload mancante', async () => {
      const res = await request(app)
        .post('/api/external-collaborators/activation')
        .send({ token: 'tok' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_PAYLOAD');
    });
  });
});
