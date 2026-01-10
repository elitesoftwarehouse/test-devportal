import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../src/app';
import { AppDataSource } from '../src/config/dataSource';
import { Collaborator } from '../src/models/Collaborator';

const TEST_FILE_PATH = path.join(__dirname, 'fixtures', 'test-cv.pdf');

describe('Admin Collaborator CV Routes', () => {
  let collaborator: Collaborator;
  let adminToken: string;

  beforeAll(async () => {
    await AppDataSource.initialize();

    const collabRepo = AppDataSource.getRepository(Collaborator);
    collaborator = await collabRepo.save(
      collabRepo.create({ firstName: 'Test', lastName: 'User', email: 'test@example.com' })
    );

    // Nota: a seconda del progetto esistente, sostituire con una modalità reale di generare il token admin
    adminToken = 'test-admin-token';
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('should upload a CV and return it as current', async () => {
    if (!fs.existsSync(TEST_FILE_PATH)) {
      fs.mkdirSync(path.dirname(TEST_FILE_PATH), { recursive: true });
      fs.writeFileSync(TEST_FILE_PATH, 'PDF');
    }

    const res = await request(app)
      .post(`/api/admin/collaborators/${collaborator.id}/cvs`)
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', TEST_FILE_PATH);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('CURRENT');
  });

  it('should list CVs for collaborator', async () => {
    const res = await request(app)
      .get(`/api/admin/collaborators/${collaborator.id}/cvs`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
