import axios, { AxiosResponse } from 'axios';

export interface CompanyCollaboratorDTO {
  associationId: number;
  collaboratorId: number;
  companyId: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AddCompanyCollaboratorPayload {
  collaboratorId?: number;
  createNew?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateCompanyCollaboratorPayload {
  role?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  email?: string;
  phone?: string;
}

const BASE_URL = '/api/companies';

export const companyCollaboratorsApi = {
  async list(companyId: number): Promise<CompanyCollaboratorDTO[]> {
    const res: AxiosResponse<CompanyCollaboratorDTO[]> = await axios.get(
      `${BASE_URL}/${companyId}/collaborators`
    );
    return res.data;
  },

  async add(companyId: number, payload: AddCompanyCollaboratorPayload): Promise<CompanyCollaboratorDTO> {
    const res: AxiosResponse<CompanyCollaboratorDTO> = await axios.post(
      `${BASE_URL}/${companyId}/collaborators`,
      payload
    );
    return res.data;
  },

  async update(
    companyId: number,
    associationId: number,
    payload: UpdateCompanyCollaboratorPayload
  ): Promise<CompanyCollaboratorDTO> {
    const res: AxiosResponse<CompanyCollaboratorDTO> = await axios.put(
      `${BASE_URL}/${companyId}/collaborators/${associationId}`,
      payload
    );
    return res.data;
  },

  async updateStatus(
    companyId: number,
    associationId: number,
    status: 'ACTIVE' | 'INACTIVE'
  ): Promise<CompanyCollaboratorDTO> {
    const res: AxiosResponse<CompanyCollaboratorDTO> = await axios.patch(
      `${BASE_URL}/${companyId}/collaborators/${associationId}/status`,
      { status }
    );
    return res.data;
  }
};
