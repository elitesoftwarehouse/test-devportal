import { CompanyRepository } from './company.repository';
import { UserCompanyOwnershipRepository } from './userCompanyOwnership.repository';
import { AccreditationState, CreateCompanyDraftDto } from './company.types';

export class CompanyAccreditationService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly ownershipRepository: UserCompanyOwnershipRepository,
  ) {}

  private validateCreatePayload(payload: CreateCompanyDraftDto): void {
    if (!payload) {
      throw new Error('VALIDATION_ERROR');
    }

    const { name, vatNumber, countryCode, email } = payload;

    if (!name || !vatNumber || !countryCode || !email) {
      throw new Error('VALIDATION_ERROR');
    }

    if (!/^[A-Z]{2}/.test(countryCode)) {
      throw new Error('VALIDATION_ERROR');
    }

    if (!/.+@.+\..+/.test(email)) {
      throw new Error('VALIDATION_ERROR');
    }
  }

  async createDraftCompany(payload: CreateCompanyDraftDto, userId: string) {
    this.validateCreatePayload(payload);

    const existing = await this.companyRepository.findByVatNumber(payload.vatNumber);
    if (existing) {
      throw new Error('VAT_ALREADY_EXISTS');
    }

    const company = await this.companyRepository.createDraft({
      name: payload.name,
      vatNumber: payload.vatNumber,
      countryCode: payload.countryCode,
      email: payload.email,
    });

    await this.ownershipRepository.linkOwnerToCompany(userId, company.id, 'LEGAL_OWNER');

    return company;
  }

  async confirmAccreditation(companyId: string, userId: string, options: { requireApproval: boolean }) {
    const isOwner = await this.ownershipRepository.isOwner(userId, companyId);
    if (!isOwner) {
      throw new Error('NOT_AUTHORIZED');
    }

    const newState = options.requireApproval ? AccreditationState.PENDING_APPROVAL : AccreditationState.ACTIVE;
    const updated = await this.companyRepository.updateState(companyId, newState);
    return updated;
  }

  async updateCompanyIfOwner(companyId: string, userId: string, patch: any) {
    const isOwner = await this.ownershipRepository.isOwner(userId, companyId);
    if (!isOwner) {
      throw new Error('NOT_AUTHORIZED');
    }

    const updated = await this.companyRepository.updateFields(companyId, patch);
    return updated;
  }
}
