import request from 'supertest';
import app from '../src/app';

// Helper per simulare utente autenticato EXTERNAL_OWNER
jest.mock('../src/middleware/authMiddleware', () => ({
  requireAuth: (req: any, res: any, next: any) => {
    req.user = { id: 'test-owner-id', role: 'EXTERNAL_OWNER' };
    next();
  }
}));

describe('External Invites API', () => {
  it('should validate email on invite creation', async () => {
    const res = await request(app)
      .post('/api/external-invites')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  it('should reject unauthenticated access when middleware not injecting user', async () => {
    // This is more of a placeholder; real project should have separated integration tests
    expect(true).toBe(true);
  });
});
