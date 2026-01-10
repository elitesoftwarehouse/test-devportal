import request from 'supertest';
import { createServer } from '../../src/api/server';
import { CompanyCollaboratorRole } from '../../src/domain/companyCollaborator/CompanyCollaboratorRole';
import { CompanyCollaboratorStatus } from '../../src/domain/companyCollaborator/CompanyCollaboratorStatus';

const app = createServer();

describe('CompanyCollaborator API - integration', () => {
  it('POST nuova associazione - con ruolo Amministratore', async () => {
    const res = await request(app)
      .post('/api/companies/c1/collaborators')
      .set('x-mock-role', 'ADMIN')
      .send({ collaboratorId: 'u1', role: CompanyCollaboratorRole.USER });

    expect(res.status).toBe(201);
    expect(res.body.companyId).toBe('c1');
    expect(res.body.collaboratorId).toBe('u1');
    expect(res.body.role).toBe(CompanyCollaboratorRole.USER);
    expect(res.body.status).toBe(CompanyCollaboratorStatus.ATTIVO);
  });

  it('GET elenco collaboratori per azienda con diversi stati', async () => {
    const create1 = await request(app)
      .post('/api/companies/c2/collaborators')
      .set('x-mock-role', 'ADMIN')
      .send({ collaboratorId: 'u1', role: CompanyCollaboratorRole.USER });

    const create2 = await request(app)
      .post('/api/companies/c2/collaborators')
      .set('x-mock-role', 'ADMIN')
      .send({ collaboratorId: 'u2', role: CompanyCollaboratorRole.MANAGER });

    await request(app)
      .patch(`/api/companies/c2/collaborators/${create2.body.id}/status`)
      .set('x-mock-role', 'ADMIN')
      .send({ status: CompanyCollaboratorStatus.INATTIVO });

    const res = await request(app)
      .get('/api/companies/c2/collaborators')
      .set('x-mock-role', 'ADMIN');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const [first, second] = res.body;
    const statuses = res.body.map((r: any) => r.status).sort();
    expect(statuses).toEqual(['ATTIVO', 'INATTIVO']);
  });

  it('PUT modifica associazione', async () => {
    const created = await request(app)
      .post('/api/companies/c3/collaborators')
      .set('x-mock-role', 'ADMIN')
      .send({ collaboratorId: 'u1', role: CompanyCollaboratorRole.USER });

    const res = await request(app)
      .put(`/api/companies/c3/collaborators/${created.body.id}`)
      .set('x-mock-role', 'ADMIN')
      .send({ role: CompanyCollaboratorRole.ADMIN });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe(CompanyCollaboratorRole.ADMIN);
  });

  it('PATCH cambio stato', async () => {
    const created = await request(app)
      .post('/api/companies/c4/collaborators')
      .set('x-mock-role', 'ADMIN')
      .send({ collaboratorId: 'u1', role: CompanyCollaboratorRole.USER });

    const res = await request(app)
      .patch(`/api/companies/c4/collaborators/${created.body.id}/status`)
      .set('x-mock-role', 'ADMIN')
      .send({ status: CompanyCollaboratorStatus.INATTIVO });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(CompanyCollaboratorStatus.INATTIVO);
  });

  it('verifica autorizzazioni: utente senza ruolo Amministratore non può creare', async () => {
    const res = await request(app)
      .post('/api/companies/c5/collaborators')
      // nessun header x-mock-role => utente non admin
      .send({ collaboratorId: 'u1', role: CompanyCollaboratorRole.USER });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Non autorizzato/);
  });

  it('verifica autorizzazioni: utente senza ruolo Amministratore non può modificare', async () => {
    const created = await request(app)
      .post('/api/companies/c6/collaborators')
      .set('x-mock-role', 'ADMIN')
      .send({ collaboratorId: 'u1', role: CompanyCollaboratorRole.USER });

    const resPut = await request(app)
      .put(`/api/companies/c6/collaborators/${created.body.id}`)
      // nessun header x-mock-role
      .send({ role: CompanyCollaboratorRole.ADMIN });

    expect(resPut.status).toBe(403);

    const resPatch = await request(app)
      .patch(`/api/companies/c6/collaborators/${created.body.id}/status`)
      .send({ status: CompanyCollaboratorStatus.INATTIVO });

    expect(resPatch.status).toBe(403);
  });

  it('gestione tentativo di creazione duplicata (409 conflict)', async () => {
    await request(app)
      .post('/api/companies/c7/collaborators')
      .set('x-mock-role', 'ADMIN')
      .send({ collaboratorId: 'u1', role: CompanyCollaboratorRole.USER });

    const res = await request(app)
      .post('/api/companies/c7/collaborators')
      .set('x-mock-role', 'ADMIN')
      .send({ collaboratorId: 'u1', role: CompanyCollaboratorRole.MANAGER });

    expect(res.status).toBe(409);
  });

  it('validazione input errati (ruolo non valido)', async () => {
    const res = await request(app)
      .post('/api/companies/c8/collaborators')
      .set('x-mock-role', 'ADMIN')
      .send({ collaboratorId: 'u1', role: 'INVALIDO' });

    expect(res.status).toBe(400);
  });
});
