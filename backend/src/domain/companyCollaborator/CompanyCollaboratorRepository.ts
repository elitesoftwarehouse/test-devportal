import { CompanyCollaborator } from './CompanyCollaborator';
import { CompanyCollaboratorRole } from './CompanyCollaboratorRole';
import { CompanyCollaboratorStatus } from './CompanyCollaboratorStatus';

export interface CompanyCollaboratorRepository {
  findById(id: string): Promise<CompanyCollaborator | null>;
  findByCompanyAndCollaborator(companyId: string, collaboratorId: string): Promise<CompanyCollaborator | null>;
  findByCompany(companyId: string): Promise<CompanyCollaborator[]>;
  create(input: {
    companyId: string;
    collaboratorId: string;
    role: CompanyCollaboratorRole;
    status: CompanyCollaboratorStatus;
  }): Promise<CompanyCollaborator>;
  update(id: string, input: { role?: CompanyCollaboratorRole; status?: CompanyCollaboratorStatus }): Promise<CompanyCollaborator>;
}
