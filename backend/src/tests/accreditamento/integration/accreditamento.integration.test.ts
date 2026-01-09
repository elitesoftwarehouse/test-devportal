import 'reflect-metadata';
import request from 'supertest';
import { createApp } from '../../../app';
import { getTestDataSource, closeTestDataSource, resetTestDatabase } from '../../utils/testDatabase';
import { EXISTING_VAT_NUMBER, buildMinimalDraftCompanyPayload } from '../fixtures/companyFixture';
import { buildExternalOwnerUserContext, buildNonOwnerUserContext } from '../mocks/userContextMock';

let app: any;

async function authHeaderFor(user: { id: string; roles: string[] }) {
  return {
    'x-test-user-id': user.id,
    'x-test-user-roles': user.roles.join(','),
  };
}

describe('Accreditamento azienda - integrazione REST/GraphQL', () => {
  beforeAll(async () => {
    const ds = await getTestDataSource();
    app = await createApp({ dataSource: ds, enableGraphql: true });
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  afterAll(async () => {
    await closeTestDataSource();
  });

  it('scenario positivo: EXTERNAL_OWNER crea e conferma accreditamento con dati validi (REST)', async () => {
    const user = buildExternalOwnerUserContext();
    const payload = buildMinimalDraftCompanyPayload();

    const createRes = await request(app)
      .post('/api/accreditamento/companies')
      .set(await authHeaderFor(user))
      .send(payload)
      .expect(201);

    expect(createRes.body).toBeDefined();
    expect(createRes.body.id).toBeDefined();
    expect(createRes.body.accreditationState).toBe('DRAFT');

    const companyId = createRes.body.id;

    const confirmRes = await request(app)
      .post(`/api/accreditamento/companies/${companyId}/confirm`)
      .set(await authHeaderFor(user))
      .send({ requireApproval: false })
      .expect(200);

    expect(confirmRes.body.accreditationState === 'ACTIVE' || confirmRes.body.accreditationState === 'PENDING_APPROVAL').toBe(true);
  });

  it('scenario negativo: utente senza ruolo EXTERNAL_OWNER tenta di accreditare un\'azienda (REST)', async () => {
    const user = buildNonOwnerUserContext();
    const payload = buildMinimalDraftCompanyPayload();

    const res = await request(app)
      .post('/api/accreditamento/companies')
      .set(await authHeaderFor(user))
      .send(payload)
      .expect(403);

    expect(res.body.errorCode).toBe('NOT_AUTHORIZED');
  });

  it('duplicazione partita IVA: creazione di un\'azienda con partita IVA già presente (REST)', async () => {
    const user = buildExternalOwnerUserContext();

    const firstPayload = buildMinimalDraftCompanyPayload({ vatNumber: EXISTING_VAT_NUMBER });
    await request(app)
      .post('/api/accreditamento/companies')
      .set(await authHeaderFor(user))
      .send(firstPayload)
      .expect(201);

    const secondPayload = buildMinimalDraftCompanyPayload({ vatNumber: EXISTING_VAT_NUMBER });

    const res = await request(app)
      .post('/api/accreditamento/companies')
      .set(await authHeaderFor(user))
      .send(secondPayload)
      .expect(409);

    expect(res.body.errorCode).toBe('VAT_ALREADY_EXISTS');
  });

  it('access control: un EXTERNAL_OWNER non può modificare aziende non collegate a lui (REST)', async () => {
    const owner1 = buildExternalOwnerUserContext({ id: 'owner-1', email: 'owner1@example.com' });
    const owner2 = buildExternalOwnerUserContext({ id: 'owner-2', email: 'owner2@example.com' });

    const payload = buildMinimalDraftCompanyPayload();
    const createRes = await request(app)
      .post('/api/accreditamento/companies')
      .set(await authHeaderFor(owner1))
      .send(payload)
      .expect(201);

    const companyId = createRes.body.id;

    const res = await request(app)
      .put(`/api/accreditamento/companies/${companyId}`)
      .set(await authHeaderFor(owner2))
      .send({ name: 'Nuovo nome non autorizzato' })
      .expect(403);

    expect(res.body.errorCode).toBe('NOT_AUTHORIZED');
  });

  it('scenario positivo GraphQL: EXTERNAL_OWNER crea e conferma accreditamento', async () => {
    const user = buildExternalOwnerUserContext();
    const payload = buildMinimalDraftCompanyPayload();

    const mutationCreate = `
      mutation CreateCompany($input: CreateCompanyInput!) {
        createCompany(input: $input) {
          id
          name
          vatNumber
          accreditationState
        }
      }
    `;

    const createRes = await request(app)
      .post('/graphql')
      .set(await authHeaderFor(user))
      .send({ query: mutationCreate, variables: { input: payload } })
      .expect(200);

    expect(createRes.body.data.createCompany.id).toBeDefined();
    expect(createRes.body.data.createCompany.accreditationState).toBe('DRAFT');

    const companyId = createRes.body.data.createCompany.id;

    const mutationConfirm = `
      mutation ConfirmCompany($id: ID!, $requireApproval: Boolean!) {
        confirmCompanyAccreditation(id: $id, requireApproval: $requireApproval) {
          id
          accreditationState
        }
      }
    `;

    const confirmRes = await request(app)
      .post('/graphql')
      .set(await authHeaderFor(user))
      .send({ query: mutationConfirm, variables: { id: companyId, requireApproval: false } })
      .expect(200);

    const state = confirmRes.body.data.confirmCompanyAccreditation.accreditationState;
    expect(state === 'ACTIVE' || state === 'PENDING_APPROVAL').toBe(true);
  });
});
