import { CompanyCollaboratorRepository } from '../../domain/companyCollaborator/CompanyCollaboratorRepository';
import { CompanyCollaborator } from '../../domain/companyCollaborator/CompanyCollaborator';
import { CompanyCollaboratorRole } from '../../domain/companyCollaborator/CompanyCollaboratorRole';
import { CompanyCollaboratorStatus } from '../../domain/companyCollaborator/CompanyCollaboratorStatus';
import { randomUUID } from 'crypto';

export class InMemoryCompanyCollaboratorRepository implements CompanyCollaboratorRepository {
  private items: CompanyCollaborator[] = [];

  async findById(id: string): Promise<CompanyCollaborator | null> {
    return this.items.find(i => i.id === id) ?? null;
  }

  async findByCompanyAndCollaborator(companyId: string, collaboratorId: string): Promise<CompanyCollaborator | null> {
    return (
      this.items.find(
        i => i.companyId === companyId && i.collaboratorId === collaboratorId
      ) ?? null
    );
  }

  async findByCompany(companyId: string): Promise<CompanyCollaborator[]> {
    return this.items.filter(i => i.companyId === companyId);
  }

  async create(input: {
    companyId: string;
    collaboratorId: string;
    role: CompanyCollaboratorRole;
    status: CompanyCollaboratorStatus;
  }): Promise<CompanyCollaborator> {
    const now = new Date();
    const entity: CompanyCollaborator = {
      id: randomUUID(),
      companyId: input.companyId,
      collaboratorId: input.collaboratorId,
      role: input.role,
      status: input.status,
      createdAt: now,
      updatedAt: now
    };
    this.items.push(entity);
    return entity;
  }

  async update(id: string, input: { role?: CompanyCollaboratorRole; status?: CompanyCollaboratorStatus }): Promise<CompanyCollaborator> {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) {
      throw new Error('CompanyCollaborator not found');
    }
    const current = this.items[idx];
    const updated: CompanyCollaborator = {
      ...current,
      role: input.role ?? current.role,
      status: input.status ?? current.status,
      updatedAt: new Date()
    };
    this.items[idx] = updated;
    return updated;
  }
}
