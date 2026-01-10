import request from 'supertest';
import app from '../src/app';
import { sequelize } from '../src/db/sequelize';
import { SkillProfile } from '../src/models/SkillProfile';

describe('SkillProfile API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('PUT /api/me/skill-profile crea e aggiorna il profilo per utente autenticato', async () => {
    const payload = {
      role: 'Software Engineer',
      keySkills: ['Java', 'Spring'],
      yearsOfExperience: 5,
      primaryLanguage: 'it',
      summary: 'Profilo di test',
    };

    const res = await request(app)
      .put('/api/me/skill-profile')
      .set('x-mock-user-id', '10')
      .send(payload)
      .expect(200);

    expect(res.body.role).toBe(payload.role);
    expect(res.body.keySkills).toEqual(payload.keySkills);
    expect(res.body.yearsOfExperience).toBe(payload.yearsOfExperience);
    expect(res.body.primaryLanguage).toBe(payload.primaryLanguage);

    const inDb = await SkillProfile.findOne({ where: { userId: 10 } });
    expect(inDb).not.toBeNull();
  });

  test('GET /api/me/skill-profile restituisce il profilo dell\'utente', async () => {
    const res = await request(app)
      .get('/api/me/skill-profile')
      .set('x-mock-user-id', '10')
      .expect(200);

    expect(res.body.userId).toBe(10);
    expect(res.body.role).toBe('Software Engineer');
  });

  test('GET /api/collaborators/skill-profiles richiede ruolo IT_OPERATOR', async () => {
    await request(app)
      .get('/api/collaborators/skill-profiles')
      .set('x-mock-user-id', '11')
      .set('x-mock-user-role', 'STANDARD')
      .expect(403);
  });

  test('GET /api/collaborators/skill-profiles filtra per ruolo e anni', async () => {
    await SkillProfile.create({
      userId: 20,
      role: 'Project Manager',
      keySkills: ['Leadership'],
      yearsOfExperience: 8,
      primaryLanguage: 'en',
    });

    const res = await request(app)
      .get('/api/collaborators/skill-profiles')
      .set('x-mock-user-id', '99')
      .set('x-mock-user-role', 'IT_OPERATOR')
      .query({ role: 'Project', minYears: 5 })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    const found = res.body.find((p: any) => p.userId === 20);
    expect(found).toBeDefined();
  });
});
