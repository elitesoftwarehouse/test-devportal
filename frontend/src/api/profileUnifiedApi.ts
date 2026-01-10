import axios, { AxiosResponse } from 'axios';

export type ProfileType = 'PROFESSIONISTA' | 'AZIENDA' | 'COLLABORATORE' | 'ALL';

export interface UnifiedProfileQuality {
  score: number; // 0-100
  level: 'LOW' | 'MEDIUM' | 'HIGH';
  missingFields: string[];
}

export interface UnifiedProfileBilling {
  vatNumber: string | null;
  iban: string | null;
}

export interface UnifiedProfilePermissions {
  canViewBilling: boolean;
}

export interface UnifiedProfile {
  id: string;
  type: ProfileType;
  displayName: string;
  roleLabel: string | null;
  mainContact: {
    email: string | null;
    phone: string | null;
  };
  active: boolean;
  quality: UnifiedProfileQuality;
  permissions: UnifiedProfilePermissions;
  billing: UnifiedProfileBilling | null;
}

export interface UnifiedProfileListResponse {
  data: UnifiedProfile[];
  meta: {
    total: number;
  };
}

export interface UnifiedProfileQuery {
  type?: ProfileType;
  qualityMin?: number;
  orderBy?: 'name' | 'type' | 'quality' | 'status';
  orderDir?: 'asc' | 'desc';
}

const client = axios.create({
  baseURL: '/api',
});

export async function fetchUnifiedProfiles(query: UnifiedProfileQuery): Promise<UnifiedProfileListResponse> {
  const params: Record<string, string> = {};

  if (query.type && query.type !== 'ALL') {
    params.type = query.type;
  }
  if (typeof query.qualityMin === 'number') {
    params.qualityMin = String(query.qualityMin);
  }
  if (query.orderBy) {
    params.orderBy = query.orderBy;
  }
  if (query.orderDir) {
    params.orderDir = query.orderDir;
  }

  const response: AxiosResponse<UnifiedProfileListResponse> = await client.get('/profiles/unified', { params });
  return response.data;
}
