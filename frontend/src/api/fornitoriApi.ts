import axios, { AxiosInstance } from 'axios';

const client: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export interface FornitoreDTO {
  id: string;
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string | null;
  email: string;
  telefono: string | null;
  indirizzo: string | null;
  cap: string | null;
  citta: string | null;
  provincia: string | null;
  stato: string | null;
  attivo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FornitoreCreatePayload {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale?: string | null;
  email: string;
  telefono?: string | null;
  indirizzo?: string | null;
  cap?: string | null;
  citta?: string | null;
  provincia?: string | null;
  stato?: string | null;
}

export interface FornitoreUpdatePayload extends Partial<FornitoreCreatePayload> {}

export interface FornitoriListResponse {
  data: FornitoreDTO[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export async function fetchFornitori(params: {
  search?: string;
  attivo?: boolean | null;
  page?: number;
  pageSize?: number;
}): Promise<FornitoriListResponse> {
  const response = await client.get('/fornitori', {
    params: {
      search: params.search,
      attivo:
        params.attivo === undefined || params.attivo === null
          ? undefined
          : params.attivo,
      page: params.page,
      pageSize: params.pageSize
    }
  });

  return response.data;
}

export async function fetchFornitore(id: string): Promise<FornitoreDTO> {
  const response = await client.get(`/fornitori/${id}`);
  return response.data.data;
}

export async function createFornitore(payload: FornitoreCreatePayload): Promise<FornitoreDTO> {
  const response = await client.post('/fornitori', payload);
  return response.data.data;
}

export async function updateFornitore(id: string, payload: FornitoreUpdatePayload): Promise<FornitoreDTO> {
  const response = await client.patch(`/fornitori/${id}`, payload);
  return response.data.data;
}

export async function updateFornitoreStato(id: string, attivo: boolean): Promise<FornitoreDTO> {
  const response = await client.patch(`/fornitori/${id}/stato`, { attivo });
  return response.data.data;
}
