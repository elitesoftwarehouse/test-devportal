import axios, { AxiosResponse } from 'axios';

export type ProfileType = 'PROFESSIONISTA' | 'AZIENDA' | 'COLLABORATORE';

export interface ProfileQualityItem {
  id: string;
  nome: string;
  tipo: ProfileType;
  completezza: number;
  statoQualita: 'OK' | 'WARNING' | 'KO';
  campiMancanti: string[];
}

export interface ProfileQualityListResponse {
  items: ProfileQualityItem[];
  total: number;
}

export interface ProfileQualityFilters {
  tipo?: ProfileType | 'ALL';
  livelloCompletezza?: 'ALL' | 'ALTA' | 'MEDIA' | 'BASSA';
  orderBy?: 'nome' | 'completezza';
  order?: 'asc' | 'desc';
}

export async function fetchProfileQualityList(
  filters: ProfileQualityFilters
): Promise<ProfileQualityListResponse> {
  const params: Record<string, string> = {};

  if (filters.tipo && filters.tipo !== 'ALL') {
    params.tipo = filters.tipo;
  }

  if (filters.livelloCompletezza && filters.livelloCompletezza !== 'ALL') {
    // Mappatura semplice a minCompletezza per il mock API
    if (filters.livelloCompletezza === 'ALTA') {
      params.minCompletezza = '80';
    }
    if (filters.livelloCompletezza === 'MEDIA') {
      params.minCompletezza = '50';
    }
    if (filters.livelloCompletezza === 'BASSA') {
      params.minCompletezza = '0';
    }
  }

  if (filters.orderBy) {
    params.orderBy = filters.orderBy;
  }

  if (filters.order) {
    params.order = filters.order;
  }

  const response: AxiosResponse<ProfileQualityListResponse> = await axios.get(
    '/api/profile-quality',
    {
      params
    }
  );

  return response.data;
}
