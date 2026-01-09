import axios, { AxiosInstance } from "axios";

export interface SupplierCompanyDto {
  id: string;
  codice: string;
  ragioneSociale: string;
  nomeCommerciale?: string | null;
  partitaIva?: string | null;
  codiceFiscale?: string | null;
  indirizzo?: string | null;
  cap?: string | null;
  citta?: string | null;
  provincia?: string | null;
  nazione?: string | null;
  telefono?: string | null;
  email?: string | null;
  sitoWeb?: string | null;
  attivo: boolean;
}

export interface UpsertSupplierCompanyRequest {
  id?: string | null;
  codice: string;
  ragioneSociale: string;
  nomeCommerciale?: string | null;
  partitaIva?: string | null;
  codiceFiscale?: string | null;
  indirizzo?: string | null;
  cap?: string | null;
  citta?: string | null;
  provincia?: string | null;
  nazione?: string | null;
  telefono?: string | null;
  email?: string | null;
  sitoWeb?: string | null;
  attivo: boolean;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
});

export async function fetchSupplierCompanies(onlyActive?: boolean): Promise<SupplierCompanyDto[]> {
  const params: Record<string, any> = {};
  if (onlyActive !== undefined) {
    params.onlyActive = onlyActive;
  }
  const response = await apiClient.get<SupplierCompanyDto[]>("/supplier-companies", { params });
  return response.data;
}

export async function fetchSupplierCompany(id: string): Promise<SupplierCompanyDto> {
  const response = await apiClient.get<SupplierCompanyDto>(`/supplier-companies/${id}`);
  return response.data;
}

export async function createSupplierCompany(payload: UpsertSupplierCompanyRequest): Promise<SupplierCompanyDto> {
  const response = await apiClient.post<SupplierCompanyDto>("/supplier-companies", payload);
  return response.data;
}

export async function updateSupplierCompany(id: string, payload: UpsertSupplierCompanyRequest): Promise<SupplierCompanyDto> {
  const response = await apiClient.put<SupplierCompanyDto>(`/supplier-companies/${id}`, payload);
  return response.data;
}
