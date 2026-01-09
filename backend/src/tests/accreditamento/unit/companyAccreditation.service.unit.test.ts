import 'reflect-metadata';
import { CompanyAccreditationService } from '../../../domain/accreditamento/companyAccreditation.service';
import { CompanyRepository } from '../../../domain/accreditamento/company.repository';
import { UserCompanyOwnershipRepository } from '../../../domain/accreditamento/userCompanyOwnership.repository';
import { AccreditationState } from '../../../domain/accreditamento/company.types';
import { buildMinimalDraftCompanyPayload, EXISTING_VAT_NUMBER } from '../fixtures/companyFixture';
import { buildExternalOwnerUserContext } from '../mocks/userContextMock';

class InMemoryCompanyRepository implements CompanyRepository {
  private companies: any[] = [];

  async findByVatNumber(vatNumber: string): Promise<any | null> {
    return this.companies.find((c) => c.vatNumber === vatNumber) ?? null;
  }

  async createDraft(data: any): Promise<any> {
    const company = {
      id: `company-${this.companies.length + 1}`,
      ...data,
      accreditationState: AccreditationState.DRAFT,
    };
    this.companies.push(company);
    return company;
  }

  async updateState(id: string, newState: AccreditationState): Promise<any> {
    const company = this.companies.find((c) => c.id === id);
    if (!company) {
      throw new Error('Company not found');
    }
    company.accreditationState = newState;
    return company;
  }

  async updateFields(id: string, patch: any): Promise<any> {
    const company = this.companies.find((c) => c.id === id);
    if (!company) {
      throw new Error('Company not found');
    }
    Object.assign(company, patch);
    return company;
  }
}

class InMemoryUserCompanyOwnershipRepository implements UserCompanyOwnershipRepository {
  private ownerships: any[] = [];

  async linkOwnerToCompany(userId: string, companyId: string, role: string): Promise<void> {
    this.ownerships.push({ userId, companyId, role });
  }

  async isOwner(userId: string, companyId: string): Promise<boolean> {
    return this.ownerships.some(
      (o) => o.userId === userId && o.companyId === companyId && o.role === 'LEGAL_OWNER',
    );
  }
}

function buildServiceWithInMemoryRepos() {
  const companyRepository = new InMemoryCompanyRepository();
  const ownershipRepository = new InMemoryUserCompanyOwnershipRepository();
  const service = new CompanyAccreditationService(companyRepository, ownershipRepository);
  return { service, companyRepository, ownershipRepository };
}

describe('CompanyAccreditationService - unit', () => {
  it('crea un\'azienda in stato DRAFT con dati minimi validi', async () => {
    const { service } = buildServiceWithInMemoryRepos();
    const payload = buildMinimalDraftCompanyPayload();
    const user = buildExternalOwnerUserContext();

    const company = await service.createDraftCompany(payload, user.id);

    expect(company).toBeDefined();
    expect(company.id).toBeDefined();
    expect(company.name).toBe(payload.name);
    expect(company.vatNumber).toBe(payload.vatNumber);
    expect(company.accreditationState).toBe(AccreditationState.DRAFT);
  });

  it('valida i campi obbligatori e i formati minimi', async () => {
    const { service } = buildServiceWithInMemoryRepos();
    const user = buildExternalOwnerUserContext();

    await expect(
      // @ts-expect-error test invalid payload
      service.createDraftCompany({ name: '', vatNumber: '', countryCode: 'IT', email: '' }, user.id),
    ).rejects.toThrow('VALIDATION_ERROR');
  });

  it('impedisce la creazione di azienda con partita IVA duplicata', async () => {
    const { service, companyRepository } = buildServiceWithInMemoryRepos();
    const user = buildExternalOwnerUserContext();

    await companyRepository.createDraft({
      name: 'Existing Company',
      vatNumber: EXISTING_VAT_NUMBER,
      countryCode: 'IT',
      email: 'existing@example.com',
    });

    const duplicatePayload = buildMinimalDraftCompanyPayload({ vatNumber: EXISTING_VAT_NUMBER });

    await expect(service.createDraftCompany(duplicatePayload, user.id)).rejects.toThrow('VAT_ALREADY_EXISTS');
  });

  it('associa l\'utente EXTERNAL_OWNER come owner legale alla creazione', async () => {
    const { service, ownershipRepository } = buildServiceWithInMemoryRepos();
    const user = buildExternalOwnerUserContext();
    const payload = buildMinimalDraftCompanyPayload();

    const company = await service.createDraftCompany(payload, user.id);

    const isOwner = await ownershipRepository.isOwner(user.id, company.id);
    expect(isOwner).toBe(true);
  });

  it('gestisce correttamente il passaggio di stato DRAFT -> ACTIVE', async () => {
    const { service } = buildServiceWithInMemoryRepos();
    const user = buildExternalOwnerUserContext();
    const payload = buildMinimalDraftCompanyPayload();

    const company = await service.createDraftCompany(payload, user.id);

    const activated = await service.confirmAccreditation(company.id, user.id, { requireApproval: false });

    expect(activated.accreditationState).toBe(AccreditationState.ACTIVE);
  });

  it('gestisce correttamente il passaggio di stato DRAFT -> PENDING_APPROVAL', async () => {
    const { service } = buildServiceWithInMemoryRepos();
    const user = buildExternalOwnerUserContext();
    const payload = buildMinimalDraftCompanyPayload();

    const company = await service.createDraftCompany(payload, user.id);

    const pending = await service.confirmAccreditation(company.id, user.id, { requireApproval: true });

    expect(pending.accreditationState).toBe(AccreditationState.PENDING_APPROVAL);
  });

  it('impedisce la conferma accreditamento se l\'utente non è owner legale', async () => {
    const { service } = buildServiceWithInMemoryRepos();
    const ownerUser = buildExternalOwnerUserContext();
    const otherUserId = 'another-user';

    const payload = buildMinimalDraftCompanyPayload();
    const company = await service.createDraftCompany(payload, ownerUser.id);

    await expect(
      service.confirmAccreditation(company.id, otherUserId, { requireApproval: false }),
    ).rejects.toThrow('NOT_AUTHORIZED');
  });
});
