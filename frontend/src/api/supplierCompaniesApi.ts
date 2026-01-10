import axios, { AxiosError } from 'axios';

export interface SupplierCompanyDTO {
  id?: number;
  businessName: string;
  vatNumber: string;
  taxCode?: string | null;
  addressStreet?: string | null;
  addressCity?: string | null;
  addressZip?: string | null;
  addressProvince?: string | null;
  addressCountry?: string | null;
  phone?: string | null;
  email?: string | null;
  pec?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
}

export type SupplierCompanyStatus = 'ACTIVE' | 'INACTIVE';

const client = axios.create({
  baseURL: '/api/admin/supplier-companies',
});

export async function listSupplierCompanies(params?: {
  search?: string;
  vatNumber?: string;
  status?: SupplierCompanyStatus | '';
}): Promise<SupplierCompanyDTO[]> {
  const response = await client.get('/', { params });
  return response.data;
}

export async function getSupplierCompany(id: number): Promise<SupplierCompanyDTO> {
  const response = await client.get(`/${id}`);
  return response.data;
}

export async function createSupplierCompany(payload: SupplierCompanyDTO): Promise<SupplierCompanyDTO> {
  try {
    const response = await client.post('/', payload);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function updateSupplierCompany(id: number, payload: SupplierCompanyDTO): Promise<SupplierCompanyDTO> {
  try {
    const response = await client.put(`/${id}`, payload);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export async function updateSupplierCompanyStatus(id: number, status: SupplierCompanyStatus): Promise<SupplierCompanyDTO> {
  try {
    const response = await client.patch(`/${id}/status`, { status });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
}

export interface ApiErrorInfo {
  type: 'validation' | 'conflict' | 'generic';
  message: string;
  fieldErrors?: { field: string; message: string }[];
}

export function parseApiError(error: unknown): ApiErrorInfo {
  const axiosError = error as AxiosError<any>;
  if (!axiosError.response) {
    return { type: 'generic', message: 'Errore di rete o server non raggiungibile' };
  }

  const { status, data } = axiosError.response;

  if (status === 400 && data && data.errors) {
    return {
      type: 'validation',
      message: data.message || 'Errore di validazione',
      fieldErrors: data.errors,
    };
  }

  if (status === 409 && data && data.code === 'VAT_NUMBER_CONFLICT') {
    return {
      type: 'conflict',
      message: data.message || 'Conflitto dati',
    };
  }

  return {
    type: 'generic',
    message: (data && data.message) || 'Errore sconosciuto durante l\'operazione',
  };
}

function handleApiError(error: unknown) {
  // Qui si potrebbe integrare un logger centralizzato
  console.error('API supplierCompanies error', error);
}
