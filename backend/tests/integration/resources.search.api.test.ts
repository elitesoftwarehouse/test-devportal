import 'reflect-metadata';
import request from 'supertest';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import { createConnection, getConnection, getRepository } from 'typeorm';
import resourceRouter from '../../src/controllers/ResourceController';
import { Resource } from '../../src/entities/Resource';
import { Skill } from '../../src/entities/Skill';
import { ensureAuthenticated } from '../../src/middleware/authMiddleware';
import { ensureAdmin } from '../../src/middleware/authorizationMiddleware';

jest.mock('../../src/middleware/authMiddleware');
jest.mock('../../src/middleware/authorizationMiddleware');

const mockedEnsureAuthenticated = ensureAuthenticated as jest.Mock;
const mockedEnsureAdmin = ensureAdmin as jest.Mock;

function buildApp(): Application {
  const app = express();
  app.use(bodyParser.json());
  app.use((req, _res, next) => {
    // per i test, supertest può iniettare l'utente nel body
    if ((req as any).testUser) {
      (req as any).user = (req as any).testUser;
    }
    next();
  });
  app.use(resourceRouter);
  return app;
}

async function seedData() {
  const resourceRepo = getRepository(Resource);
  const skillRepo = getRepository(Skill);

  await resourceRepo.delete({});
  await skillRepo.delete({});

  const java = await skillRepo.save(skillRepo.create({ name: 'Java' }));
  const react = await skillRepo.save(skillRepo.create({ name: 'React' }));
  const sql = await skillRepo.save(skillRepo.create({ name: 'SQL' }));

  const r1 = resourceRepo.create({ name: 'Mario Rossi', role: 'Developer', skills: [java, react] });
  const r2 = resourceRepo.create({ name: 'Luigi Bianchi', role: 'Developer', skills: [java] });
  const r3 = resourceRepo.create({ name: 'Anna Verdi', role: 'Project Manager', skills: [sql] });

  await resourceRepo.save([r1, r2, r3]);
}

describe('GET /resources/search (integrazione)', () => {
  let app: Application;

  beforeAll(async () => {
    await createConnection();
    app = buildApp();
  });

  afterAll(async () => {
    const conn = getConnection();
    await conn.close();
  });

  beforeEach(async () => {
    mockedEnsureAuthenticated.mockImplementation((req, _res, next) => {
      (req as any).user = (req as any).testUser || { id: 1, roles: ['ADMIN'] };
      next();
    });

    mockedEnsureAdmin.mockImplementation((req, res, next) => {
      const user: any = (req as any).user;
      if (!user || !user.roles || !user.roles.includes('ADMIN')) {
        return res.status(403).json({ message: 'Accesso negato' });
      }
      next();
    });

    await seedData();
  });

  it('restituisce solo risorse che matchano per nome (case insensitive)', async () => {
    const res = await request(app)
      .get('/resources/search')
      .query({ name: 'mario' })
      .set('testUser', JSON.stringify({ id: 1, roles: ['ADMIN'] }));

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].name).toBe('Mario Rossi');
  });

  it('filtra per ruolo e skills ANY', async () => {
    const res = await request(app)
      .get('/resources/search')
      .query({ role: 'Developer', skills: 'React', skillsMatchMode: 'ANY' });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].name).toBe('Mario Rossi');
  });

  it('filtra per skills con modalità ALL', async () => {
    const res = await request(app)
      .get('/resources/search')
      .query({ skills: 'Java,React', skillsMatchMode: 'ALL' });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].name).toBe('Mario Rossi');
  });

  it('quando skillsMatchMode non è specificato usa ANY di default', async () => {
    const res = await request(app)
      .get('/resources/search')
      .query({ skills: 'Java' });

    expect(res.status).toBe(200);
    // Mario e Luigi hanno Java
    expect(res.body.total).toBe(2);
    const names = res.body.items.map((i: any) => i.name).sort();
    expect(names).toEqual(['Luigi Bianchi', 'Mario Rossi']);
  });

  it('applica correttamente la paginazione', async () => {
    const page1 = await request(app)
      .get('/resources/search')
      .query({ page: 1, pageSize: 2 });

    expect(page1.status).toBe(200);
    expect(page1.body.items).toHaveLength(2);
    expect(page1.body.total).toBe(3);

    const page2 = await request(app)
      .get('/resources/search')
      .query({ page: 2, pageSize: 2 });

    expect(page2.status).toBe(200);
    expect(page2.body.items).toHaveLength(1);
    expect(page2.body.total).toBe(3);
  });

  it('rifiuta utenti non admin con 403', async () => {
    mockedEnsureAuthenticated.mockImplementation((req, _res, next) => {
      (req as any).user = { id: 2, roles: ['USER'] };
      next();
    });

    const res = await request(app)
      .get('/resources/search')
      .query({ name: 'Mario' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Accesso negato');
  });
});
