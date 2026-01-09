import { Router, Request, Response } from 'express';
import request from 'supertest';
import { createApp } from '../../app';
import { getTestDataSource, resetTestDatabase } from '../../tests/utils/testDatabase';
import { buildExternalOwnerUserContext, buildNonOwnerUserContext } from '../../tests/accreditamento/mocks/userContextMock';
import { buildMinimalDraftCompanyPayload } from '../../tests/accreditamento/fixtures/companyFixture';

export const accreditamentoTestingRouter = Router();

async function authHeaderFor(user: { id: string; roles: string[] }) {
  return {
    'x-test-user-id': user.id,
    'x-test-user-roles': user.roles.join(','),
  };
}

accreditamentoTestingRouter.post('/run', async (req: Request, res: Response) => {
  try {
    const ds = await getTestDataSource();
    const app = await createApp({ dataSource: ds, enableGraphql: false });
    await resetTestDatabase();

    const details: string[] = [];

    // Scenario 1: positivo EXTERNAL_OWNER
    const owner = buildExternalOwnerUserContext();
    const payload = buildMinimalDraftCompanyPayload();

    const createRes = await request(app)
      .post('/api/accreditamento/companies')
      .set(await authHeaderFor(owner))
      .send(payload);

    if (createRes.status !== 201) {
      throw new Error(`Scenario positivo: creazione azienda fallita con status ${createRes.status}`);
    }

    const companyId = createRes.body.id;
    details.push('Scenario positivo: creazione azienda DRAFT OK');

    const confirmRes = await request(app)
      .post(`/api/accreditamento/companies/${companyId}/confirm`)
      .set(await authHeaderFor(owner))
      .send({ requireApproval: false });

    if (confirmRes.status !== 200) {
      throw new Error(`Scenario positivo: conferma accreditamento fallita con status ${confirmRes.status}`);
    }

    details.push('Scenario positivo: conferma accreditamento OK');

    // Scenario 2: utente senza ruolo EXTERNAL_OWNER
    const nonOwner = buildNonOwnerUserContext();
    const negativeRes = await request(app)
      .post('/api/accreditamento/companies')
      .set(await authHeaderFor(nonOwner))
      .send(buildMinimalDraftCompanyPayload());

    if (negativeRes.status !== 403) {
      throw new Error(`Scenario negativo ruolo: atteso 403, ottenuto ${negativeRes.status}`);
    }

    details.push('Scenario negativo: blocco utente senza ruolo EXTERNAL_OWNER OK');

    return res.json({
      success: true,
      summary: 'Tutti gli scenari di accreditamento principali sono passati.',
      details,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      summary: 'Errore durante l\'esecuzione dei test di integrazione per l\'accreditamento.',
      details: [err.message || 'Errore sconosciuto'],
    });
  }
});
