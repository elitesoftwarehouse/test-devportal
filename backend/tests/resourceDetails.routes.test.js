const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/sequelize');
const Resource = require('../src/models/Resource');
const ResourceCv = require('../src/models/ResourceCv');

describe('Resource details API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('GET /api/resources/:id/details ritorna dettagli e cvs', async () => {
    const resource = await Resource.create({
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario.rossi@example.com',
      role: 'Software Engineer',
      seniority: 'Senior',
      mainSkills: 'Backend, Node.js, SQL',
      skillTags: ['Node.js', 'PostgreSQL'],
      languages: [{ code: 'it', level: 'Madrelingua' }],
      availability: 'Disponibile da subito',
      isActive: true
    });

    await ResourceCv.create({
      resourceId: resource.id,
      title: 'CV Italiano',
      language: 'it',
      fileName: 'cv_mario_rossi_it.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 102400,
      storageFileId: 'cv_mario_rossi_it.pdf',
      isPrimary: true
    });

    const res = await request(app)
      .get(`/api/resources/${resource.id}/details`)
      .set('X-Demo-Admin', 'true')
      .expect(200);

    expect(res.body.resource).toBeDefined();
    expect(res.body.resource.firstName).toBe('Mario');
    expect(Array.isArray(res.body.cvs)).toBe(true);
    expect(res.body.cvs.length).toBe(1);
    expect(res.body.cvs[0].downloadUrl).toContain(`/api/resources/${resource.id}/cvs/`);
  });

  test('GET /api/resources/:id/cvs/:cvId/download vietato se non admin', async () => {
    const resource = await Resource.create({
      firstName: 'Luca',
      lastName: 'Bianchi'
    });

    const cv = await ResourceCv.create({
      resourceId: resource.id,
      title: 'CV',
      language: 'it',
      fileName: 'cv.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 1234,
      storageFileId: 'cv.pdf',
      isPrimary: false
    });

    const res = await request(app)
      .get(`/api/resources/${resource.id}/cvs/${cv.id}/download`)
      .expect(403);

    expect(res.body.message).toMatch(/Amministratore/);
  });
});
