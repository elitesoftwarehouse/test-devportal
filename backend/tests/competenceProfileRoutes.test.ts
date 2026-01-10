import request from 'supertest';
import express, { Application } from 'express';
import bodyParser from 'body-parser';
import competenceProfileRoutes from '../src/routes/competenceProfileRoutes';
import { CompetenceProfile } from '../src/models/CompetenceProfile';

jest.mock('../src/models/CompetenceProfile');

const MockedCompetenceProfile = CompetenceProfile as jest.Mocked<typeof CompetenceProfile>;

function createApp(): Application {
  const app = express();
  app.use(bodyParser.json());
  app.use((req, _res, next) => {
    (req as any).user = { id: 1 };
    next();
  });
  app.use('/api/competence-profile', competenceProfileRoutes);
  return app;
}

describe('CompetenceProfile routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/competence-profile returns empty defaults when no profile', async () => {
    (MockedCompetenceProfile.findOne as any).mockResolvedValue(null);

    const app = createApp();
    const res = await request(app).get('/api/competence-profile');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      role: null,
      keySkills: [],
      yearsOfExperience: null,
      primaryLanguage: null,
    });
  });

  it('PUT /api/competence-profile validates required fields', async () => {
    const app = createApp();
    const res = await request(app)
      .put('/api/competence-profile')
      .send({ role: '', primaryLanguage: '' });

    expect(res.status).toBe(400);
    expect(res.body.errors.role).toBeDefined();
    expect(res.body.errors.primaryLanguage).toBeDefined();
  });

  it('PUT /api/competence-profile creates or updates profile', async () => {
    const mockSave = jest.fn();
    (MockedCompetenceProfile.findOrCreate as any).mockResolvedValue([
      {
        role: 'Software Engineer',
        keySkills: ['React'],
        yearsOfExperience: 5,
        primaryLanguage: 'it-IT',
        save: mockSave,
      },
      false,
    ]);

    const app = createApp();
    const res = await request(app)
      .put('/api/competence-profile')
      .send({
        role: 'Software Engineer',
        keySkills: ['React'],
        yearsOfExperience: 5,
        primaryLanguage: 'it-IT',
      });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('Software Engineer');
    expect(res.body.keySkills).toEqual(['React']);
  });
});
