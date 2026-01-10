import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../src/app';
import { sequelize } from '../src/db';
import User, { UserRole } from '../src/models/User';
import Collaborator from '../src/models/Collaborator';

describe('Collaborator CV API', () => {
  let adminToken: string;
  let collaboratorId: number;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const admin = await User.create({
      email: 'admin@example.com',
      passwordHash: 'hash',
      role: UserRole.ADMIN,
    });

    // Si assume esista una utility per generare JWT; qui semplificato
    adminToken = `Bearer test-admin-token-${admin.id}`;

    const collab = await Collaborator.create({
      firstName: 'Mario',
      lastName: 'Rossi',
    } as any);
    collaboratorId = collab.id;
  });

  it('dovrebbe rifiutare upload senza autenticazione', async () => {
    const res = await request(app)
      .post(`/api/collaborators/${collaboratorId}/cv`)
      .attach('file', Buffer.from('test'), 'cv.pdf');
    expect(res.status).toBe(401);
  });

  it('dovrebbe permettere upload CV con admin', async () => {
    const filePath = path.join(__dirname, 'fixtures', 'sample.pdf');
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, 'PDF');
    }

    const res = await request(app)
      .post(`/api/collaborators/${collaborId}/cv`)
      .set('Authorization', adminToken)
      .attach('file', filePath);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('collaboratorId', collaboratorId);
  });

  afterAll(async () => {
    await sequelize.close();
  });
});
