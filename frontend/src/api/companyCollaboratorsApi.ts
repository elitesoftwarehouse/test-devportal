import axios, { AxiosInstance } from 'axios';

export interface CompanyCollaboratorUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CompanyCollaboratorDto {
  id: string;
  companyId: string;
  userId: string;
  role: string;
  status: 'ATTIVO' | 'INATTIVO';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: CompanyCollaboratorUser;
}

export interface CompanyCollaboratorListResponse {
  content: CompanyCollaboratorDto[];
  page: number;
  size: number;
  total: number;
}

class CompanyCollaboratorsApi {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
    });
  }

  async list(companyId: string, params: { status?: string; page?: number; size?: number } = {}): Promise<CompanyCollaboratorListResponse> {
    const response = await this.client.get(`/companies/${companyId}/collaborators`, {
      params,
    });
    return response.data;
  }

  async create(companyId: string, payload: { userId: string; role: string; notes?: string }): Promise<CompanyCollaboratorDto> {
    const response = await this.client.post(`/companies/${companyId}/collaborators`, payload);
    return response.data;
  }

  async update(companyId: string, id: string, payload: { role?: string; notes?: string }): Promise<CompanyCollaboratorDto> {
    const response = await this.client.put(`/companies/${companyId}/collaborators/${id}`, payload);
    return response.data;
  }

  async updateStatus(companyId: string, id: string, status: 'ATTIVO' | 'INATTIVO'): Promise<CompanyCollaboratorDto> {
    const response = await this.client.patch(`/companies/${companyId}/collaborators/${id}/status`, { status });
    return response.data;
  }
}

export const companyCollaboratorsApi = new CompanyCollaboratorsApi();
