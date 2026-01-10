import {
  CompanyCollaborator,
  CreateCompanyCollaboratorInput,
  UpdateCompanyCollaboratorInput,
  ToggleCompanyCollaboratorStatusInput
} from './CompanyCollaborator';
import { CompanyCollaboratorRepository } from './CompanyCollaboratorRepository';
import { CompanyCollaboratorStatus } from './CompanyCollaboratorStatus';
import { isValidCompanyCollaboratorRole } from './CompanyCollaboratorRole';

export class CompanyCollaboratorService {
  constructor(private readonly repository: CompanyCollaboratorRepository) {}

  async createAssociation(input: CreateCompanyCollaboratorInput): Promise<CompanyCollaborator> {
    if (!input.companyId) {
      throw new Error('companyId mancante');
    }
    if (!input.collaboratorId) {
      throw new Error('collaboratorId mancante');
    }
    if (!isValidCompanyCollaboratorRole(input.role)) {
      throw new Error('Ruolo non valido');
    }

    const existing = await this.repository.findByCompanyAndCollaborator(
      input.companyId,
      input.collaboratorId
    );
    if (existing) {
      const err: any = new Error('Associazione già esistente');
      err.code = 'CONFLICT';
      throw err;
    }

    return this.repository.create({
      companyId: input.companyId,
      collaboratorId: input.collaboratorId,
      role: input.role,
      status: CompanyCollaboratorStatus.ATTIVO
    });
  }

  async updateAssociation(id: string, input: UpdateCompanyCollaboratorInput): Promise<CompanyCollaborator> {
    if (!id) {
      throw new Error('id mancante');
    }
    if (input.role && !isValidCompanyCollaboratorRole(input.role)) {
      throw new Error('Ruolo non valido');
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      const err: any = new Error('Associazione non trovata');
      err.code = 'NOT_FOUND';
      throw err;
    }

    return this.repository.update(id, { role: input.role });
  }

  async toggleStatus(id: string, input: ToggleCompanyCollaboratorStatusInput): Promise<CompanyCollaborator> {
    if (!id) {
      throw new Error('id mancante');
    }
    if (!input.status) {
      throw new Error('status mancante');
    }

    if (!Object.values(CompanyCollaboratorStatus).includes(input.status)) {
      throw new Error('Status non valido');
    }

    const existing = await this.repository.findById(id);
    if (!existing) {
      const err: any = new Error('Associazione non trovata');
      err.code = 'NOT_FOUND';
      throw err;
    }

    return this.repository.update(id, { status: input.status });
  }

  async listByCompany(companyId: string): Promise<CompanyCollaborator[]> {
    if (!companyId) {
      throw new Error('companyId mancante');
    }
    return this.repository.findByCompany(companyId);
  }
}
