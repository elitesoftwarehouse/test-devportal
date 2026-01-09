import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api'
});

export interface SedeLegaleInput {
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
}

export interface CompanyFormData {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale?: string;
  sedeLegale: SedeLegaleInput;
  email: string;
  telefono?: string;
}

export interface CompanyResponse {
  id: number;
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale?: string | null;
  sedeLegaleIndirizzo?: string;
  sedeLegaleCap?: string;
  sedeLegaleCitta?: string;
  sedeLegaleProvincia?: string;
  email: string;
  telefono?: string | null;
  statoAccreditamento: string;
}

export async function createCompanyFirstAccreditationDraft(data: CompanyFormData): Promise<CompanyResponse> {
  const response = await apiClient.post<CompanyResponse>('/companies/first-accreditation', data);
  return response.data;
}

export async function completeCompanyFirstAccreditation(id: number, data: CompanyFormData): Promise<CompanyResponse> {
  const response = await apiClient.put<CompanyResponse>(`/companies/${id}/first-accreditation`, data);
  return response.data;
}

export async function getCompanyById(id: number): Promise<any> {
  const response = await apiClient.get(`/companies/${id}`);
  return response.data;
}
