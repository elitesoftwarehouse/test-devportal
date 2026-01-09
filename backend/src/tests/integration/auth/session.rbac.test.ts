import request from 'supertest';
import http from 'http';
import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';

import { buildTestUser, TEST_PASSWORD, TestRole } from '../../helpers/testUsers';

interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  active: boolean;
  role: TestRole;
}

const usersByEmail: Map<string, UserRecord> = new Map();

async function seedUser(role: TestRole, overrides?: Partial<UserRecord>) {
  const base = await buildTestUser(role, overrides);
  const record: UserRecord = {
    id: base.id,
    email: base.email,
    passwordHash: base.passwordHash,
    active: base.active,
    role: base.role,
  };
  usersByEmail.set(record.email, record);
  return { ...record, password: base.password };
}

function findUserByEmail(email: string): UserRecord | undefined {
  return usersByEmail.get(email);
}

const SESSION_SECRET = 'test-session-secret';

function createTestApp(): Application {
  const app = express();

  app.use(cookieParser());
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(bodyParser.json());

  app.post('/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password sono obbligatori' });
    }

    const user = findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    if (!user.active) {
      return res.status(401).json({ message: 'Utente disattivato' });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  });

  app.post('/auth/logout', (req: Request, res: Response) => {
    if (!req.session) {
      return res.status(200).json({ message: 'Logout eseguito' });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Errore durante il logout' });
      }
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: 'Logout eseguito' });
    });
  });

  function requireAuth(req: Request, res: Response, next: () => void) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Autenticazione richiesta' });
    }
    return next();
  }

  function requireRole(allowedRoles: TestRole[]) {
    return (req: Request, res: Response, next: () => void) => {
      if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'Autenticazione richiesta' });
      }
      const role = req.session.user.role as TestRole | undefined;
      if (!role || !allowedRoles.includes(role)) {
        return res.status(403).json({ message: 'Accesso negato' });
      }
      return next();
    };
  }

  app.get(
    '/protected/rbac-demo',
    requireAuth,
    requireRole(['IT_OPERATOR', 'SYS_ADMIN']),
    (req: Request, res: Response) => {
      return res.status(200).json({
        message: 'Accesso consentito',
        user: req.session.user,
      });
    }
  );

  return app;
}

describe('Auth, sessione e RBAC - integrazione', () => {
  let app: Application;
  let server: http.Server;

  beforeAll(() => {
    app = createTestApp();
    server = app.listen();
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    usersByEmail.clear();
  });

  describe('POST /auth/login', () => {
    it('effettua login corretto con credenziali valide e imposta cookie di sessione', async () => {
      const user = await seedUser('EXTERNAL_OWNER');

      const res = await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: TEST_PASSWORD })
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: user.id,
          email: user.email,
          role: 'EXTERNAL_OWNER',
        })
      );

      const setCookieHeader = res.headers['set-cookie'];
      expect(setCookieHeader).toBeDefined();
      expect(setCookieHeader.join(';')).toContain('connect.sid');

      expect(JSON.stringify(res.body)).not.toContain(TEST_PASSWORD);
    });

    it('rifiuta login con email inesistente restituendo 401', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'non-esiste@example.test', password: TEST_PASSWORD })
        .expect(401);

      expect(res.body.message).toBeDefined();
    });

    it('rifiuta login con password errata restituendo 401', async () => {
      const user = await seedUser('EXTERNAL_COLLABORATOR');

      const res = await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: 'password-sbagliata' })
        .expect(401);

      expect(res.body.message).toBeDefined();
    });

    it('rifiuta login per utente disattivato', async () => {
      const user = await seedUser('IT_OPERATOR', { active: false });

      const res = await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: TEST_PASSWORD })
        .expect(401);

      expect(res.body.message).toBe('Utente disattivato');
    });
  });

  describe('POST /auth/logout', () => {
    it('invalida la sessione e impedisce accesso successivo a endpoint protetto', async () => {
      const user = await seedUser('SYS_ADMIN');

      const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: TEST_PASSWORD })
        .expect(200);

      const cookies = loginRes.headers['set-cookie'];
      expect(cookies).toBeDefined();

      await request(app)
        .get('/protected/rbac-demo')
        .set('Cookie', cookies)
        .expect(200);

      await request(app)
        .post('/auth/logout')
        .set('Cookie', cookies)
        .expect(200);

      await request(app)
        .get('/protected/rbac-demo')
        .set('Cookie', cookies)
        .expect(401);
    });
  });

  describe('Middleware RBAC', () => {
    it('nega accesso (401) a endpoint protetto senza autenticazione', async () => {
      await request(app).get('/protected/rbac-demo').expect(401);
    });

    it('nega accesso (403) a utente autenticato senza ruolo richiesto', async () => {
      const user = await seedUser('EXTERNAL_OWNER');

      const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: TEST_PASSWORD })
        .expect(200);

      const cookies = loginRes.headers['set-cookie'];

      await request(app)
        .get('/protected/rbac-demo')
        .set('Cookie', cookies)
        .expect(403);
    });

    it('permette accesso (200) a utente con ruolo IT_OPERATOR', async () => {
      const user = await seedUser('IT_OPERATOR');

      const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: TEST_PASSWORD })
        .expect(200);

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .get('/protected/rbac-demo')
        .set('Cookie', cookies)
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Accesso consentito',
        })
      );
      expect(res.body.user.role).toBe('IT_OPERATOR');
    });

    it('permette accesso (200) a utente con ruolo SYS_ADMIN', async () => {
      const user = await seedUser('SYS_ADMIN');

      const loginRes = await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: TEST_PASSWORD })
        .expect(200);

      const cookies = loginRes.headers['set-cookie'];

      const res = await request(app)
        .get('/protected/rbac-demo')
        .set('Cookie', cookies)
        .expect(200);

      expect(res.body.user.role).toBe('SYS_ADMIN');
    });

    it('copre scenari positivi/negativi per tutti i ruoli principali', async () => {
      const roles: TestRole[] = [
        'EXTERNAL_OWNER',
        'EXTERNAL_COLLABORATOR',
        'IT_OPERATOR',
        'SYS_ADMIN',
      ];

      for (const role of roles) {
        const user = await seedUser(role);

        const loginRes = await request(app)
          .post('/auth/login')
          .send({ email: user.email, password: TEST_PASSWORD })
          .expect(200);

        const cookies = loginRes.headers['set-cookie'];

        const expectedStatus =
          role === 'IT_OPERATOR' || role === 'SYS_ADMIN' ? 200 : 403;

        const res = await request(app)
          .get('/protected/rbac-demo')
          .set('Cookie', cookies)
          .expect(expectedStatus);

        if (expectedStatus === 200) {
          expect(res.body.user.role).toBe(role);
        } else {
          expect(res.body.message).toBe('Accesso negato');
        }
      }
    });
  });
});
