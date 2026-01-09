import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { externalCollaboratorsRouter } from '../src/routes/externalCollaborators';

// Middleware di test per simulare un utente autenticato con azienda
function mockAuth(req: any, _res: any, next: any) {
  req.user = { id: 1, companyId: 1 };
  next();
}

const app = express();
app.use(bodyParser.json());
app.use(mockAuth);
app.use(externalCollaboratorsRouter);

describe('External collaborator invitations API', () => {
  it('should return 400 if email is missing', async () => {
    const res = await request(app).post('/api/external-collaborators/invitations').send({});
    expect(res.status).toBe(400);
  });

  // Altri test andrebbero aggiunti collegandosi a un DB test e gestendo le migrazioni.
});
