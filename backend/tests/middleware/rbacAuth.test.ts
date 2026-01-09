import request from 'supertest';
import express, { Application } from 'express';
import session from 'express-session';
import rbacExampleRoutes from '../../src/routes/rbacExample.routes';
import { UserRole } from '../../src/constants/roles';

function createTestApp(): Application {
  const app = express();
  app.use(express.json());
  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  // Middleware per iniettare un utente di test in base agli header
  app.use((req: any, _res, next) => {
    const roleHeader = req.headers['x-test-role'];
    if (roleHeader) {
      const roles = String(roleHeader)
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean) as UserRole[];
      req.session.user = {
        id: 'test-user',
        email: 'test@example.com',
        roles,
      };
    }
    next();
  });

  app.use('/api', rbacExampleRoutes);
  return app;
}

const app = createTestApp();

describe('RBAC middleware', () => {
  it('restituisce 401 se non autenticato', async () => {
    const res = await request(app).get('/api/rbac/authenticated-generic');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Accesso non autorizzato');
  });

  it('permette accesso autenticato generico con qualunque ruolo', async () => {
    const res = await request(app)
      .get('/api/rbac/authenticated-generic')
      .set('x-test-role', UserRole.EXTERNAL_OWNER);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('nega accesso a sys-admin-only per utente senza ruolo SYS_ADMIN', async () => {
    const res = await request(app)
      .get('/api/rbac/sys-admin-only')
      .set('x-test-role', UserRole.EXTERNAL_OWNER);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Accesso non autorizzato');
  });

  it('permette accesso a sys-admin-only per SYS_ADMIN', async () => {
    const res = await request(app)
      .get('/api/rbac/sys-admin-only')
      .set('x-test-role', UserRole.SYS_ADMIN);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.roles).toContain(UserRole.SYS_ADMIN);
  });

  it('permette accesso a external-only per EXTERNAL_OWNER o EXTERNAL_COLLABORATOR', async () => {
    const ownerRes = await request(app)
      .get('/api/rbac/external-only')
      .set('x-test-role', UserRole.EXTERNAL_OWNER);
    expect(ownerRes.status).toBe(200);

    const collabRes = await request(app)
      .get('/api/rbac/external-only')
      .set('x-test-role', UserRole.EXTERNAL_COLLABORATOR);
    expect(collabRes.status).toBe(200);
  });

  it('nega accesso a external-only per IT_OPERATOR', async () => {
    const res = await request(app)
      .get('/api/rbac/external-only')
      .set('x-test-role', UserRole.IT_OPERATOR);
    expect(res.status).toBe(403);
  });
});
