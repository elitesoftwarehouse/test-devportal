import { CompanyCollaboratorRole } from './CompanyCollaboratorRole';
import { CompanyCollaboratorStatus } from './CompanyCollaboratorStatus';

export interface CompanyCollaborator {
  id: string;
  companyId: string;
  collaboratorId: string;
  role: CompanyCollaboratorRole;
  status: CompanyCollaboratorStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyCollaboratorInput {
  companyId: string;
  collaboratorId: string;
  role: CompanyCollaboratorRole;
}

export interface UpdateCompanyCollaboratorInput {
  role?: CompanyCollaboratorRole;
}

export interface ToggleCompanyCollaboratorStatusInput {
  status: CompanyCollaboratorStatus;
}
