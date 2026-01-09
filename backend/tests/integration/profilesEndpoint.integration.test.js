import express from 'express';
import request from 'supertest';
import bodyParser from 'body-parser';
import profilesRouter from '../../src/modules/profiles/profileController.js';
import { sequelize } from '../../src/sequelize.js';
import { ProfessionalProfile } from '../../src/models/ProfessionalProfile.js';
import { CollaboratorProfile } from '../../src/models/CollaboratorProfile.js';
import { Company } from '../../src/models/Company.js';

// Middleware di autenticazione fittizio per i test
function fakeAuth(role, userId, companyId) {
  return (req, _res, next) => {
    req.user = { id: userId, role, companyId };
    next();
  };
}

describe('GET /api/profiles - integrazione', () => {
  let app;

  beforeAll(async () => {
    app = express();
    app.use(bodyParser.json());

    // Setup DB in-memory
    await sequelize.sync({ force: true });

    // Dataset realistico minimo
    const company1 = await Company.create({
      name: 'ACME',
      vatNumber: 'IT0001',
      legalAddress: 'Via Roma 1',
      website: 'https://acme.test',
      industry: 'Software',
      internalNotes: 'Nota aziendale'
    });
    const company2 = await Company.create({
      name: 'Globex',
      vatNumber: 'IT0002',
      legalAddress: 'Via Milano 2',
      website: null,
      industry: null,
      internalNotes: 'Confidenziale'
    });

    await ProfessionalProfile.bulkCreate([
      {
        userId: 1,
        companyId: company1.id,
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        role: 'Dev',
        skills: ['JS', 'React'],
        phone: '123',
        address: 'Via Dev 1',
        linkedinUrl: 'https://linkedin.com/in/mario',
        taxCode: 'MRARSS...',
        salary: 45000,
        internalNotes: 'Senior dev'
      },
      {
        userId: 2,
        companyId: company2.id,
        firstName: 'Luigi',
        lastName: 'Verdi',
        email: null,
        role: null,
        skills: [],
        phone: null,
        address: null,
        linkedinUrl: null,
        taxCode: 'VRDLGI...',
        salary: 30000,
        internalNotes: 'Junior dev'
      }
    ]);

    await CollaboratorProfile.bulkCreate([
      {
        userId: 3,
        companyId: company1.id,
        firstName: 'Carla',
        lastName: 'Bianchi',
        email: 'carla.bianchi@example.com',
        phone: '999',
        taxCode: 'CRLBNC...',
        internalNotes: 'Part-time'
      }
    ]);

    // Router montato dopo auth; per i test cambieremo l"auth" a seconda del caso
  });

  afterAll(async () => {
    await sequelize.close();
  });

  function buildAppWithAuth(role, userId, companyId) {
    const testApp = express();
    testApp.use(bodyParser.json());
    testApp.use(fakeAuth(role, userId, companyId));
    testApp.use(profilesRouter);
    return testApp;
  }

  it('restituisce profili con completezza e filtra i campi sensibili per USER', async () => {
    const appUser = buildAppWithAuth('USER', 1, 1);

    const res = await request(appUser).get('/api/profiles').expect(200);

    expect(res.body).toHaveProperty('data');
    const mario = res.body.data.find((p) => p.userId === 1 && p.type === 'PROFESSIONISTA');
    expect(mario).toBeDefined();

    // Verifica campi sensibili nascosti
    expect(mario.taxCode).toBeUndefined();
    expect(mario.salary).toBeUndefined();
    expect(mario.internalNotes).toBeUndefined();

    // Verifica completezza
    expect(mario.completeness).toBeDefined();
    expect(typeof mario.completeness.percentage).toBe('number');
    expect(mario.completeness.level).toBeDefined();
    expect(Array.isArray(mario.completeness.missingKeyFields)).toBe(true);
  });

  it('restituisce payload completo per ADMIN, inclusi campi sensibili', async () => {
    const appAdmin = buildAppWithAuth('ADMIN', 999, null);

    const res = await request(appAdmin).get('/api/profiles').expect(200);
    const mario = res.body.data.find((p) => p.userId === 1 && p.type === 'PROFESSIONISTA');

    expect(mario.taxCode).toBeDefined();
    expect(mario.salary).toBeDefined();
    expect(mario.internalNotes).toBeDefined();
  });

  it('applica filtri di visibilità sui profili per utenti standard', async () => {
    const appUserCompany1 = buildAppWithAuth('USER', 3, 1);

    const res = await request(appUserCompany1).get('/api/profiles').expect(200);

    // Utente 3 (collaboratore) azienda 1 non dovrebbe vedere il professionista di azienda 2
    const luigi = res.body.data.find((p) => p.userId === 2 && p.type === 'PROFESSIONISTA');
    expect(luigi).toBeUndefined();

    // Ma deve vedere il collaboratore della stessa azienda
    const carla = res.body.data.find((p) => p.userId === 3 && p.type === 'COLLABORATORE');
    expect(carla).toBeDefined();
  });

  it('supporta filtro per tipo di profilo', async () => {
    const appAdmin = buildAppWithAuth('ADMIN', 999, null);

    const resProf = await request(appAdmin).get('/api/profiles?type=PROFESSIONISTA').expect(200);
    expect(resProf.body.data.every((p) => p.type === 'PROFESSIONISTA')).toBe(true);

    const resAz = await request(appAdmin).get('/api/profiles?type=AZIENDA').expect(200);
    expect(resAz.body.data.every((p) => p.type === 'AZIENDA')).toBe(true);
  });

  it('esegue query con include per evitare N+1 sulle associazioni principali', async () => {
    const appAdmin = buildAppWithAuth('ADMIN', 999, null);

    const spy = jest.spyOn(sequelize, 'query');

    await request(appAdmin).get('/api/profiles').expect(200);

    // Non possiamo verificare esattamente l"assenza di N+1 senza introspezione delle query,
    // ma possiamo almeno assicurarci che il numero di query rimanga ragionevole
    // (<= 10 per l"endpoint completo in questo dataset ridotto).
    const count = spy.mock.calls.length;
    spy.mockRestore();

    expect(count).toBeLessThanOrEqual(10);
  });
});
