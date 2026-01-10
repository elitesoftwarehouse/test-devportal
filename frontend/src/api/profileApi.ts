export type ProfileTypeFilter = 'ALL' | 'PROFESSIONISTA' | 'AZIENDA' | 'COLLABORATORE';

export interface UnifiedProfileQuality {
  percentComplete: number;
  level: 'ALTA' | 'MEDIA' | 'BASSA';
  missingFields: string[];
}

export interface UnifiedProfile {
  id: number;
  profileType: 'PROFESSIONISTA' | 'AZIENDA' | 'COLLABORATORE';
  name: string;
  role?: string | null;
  mainContacts: {
    email?: string | null;
    phone?: string | null;
  };
  companyId?: number | null;
  companyName?: string | null;
  isActive: boolean;
  quality: UnifiedProfileQuality;
  meta: {
    profileTypeLabel: string;
    keyFields: Array<{
      key: string;
      label: string;
      criticalFor: Array<'ODL' | 'CV' | 'FATTURAZIONE'>;
    }>;
  };
  sensitive?: {
    codiceFiscale?: string | null;
    partitaIva?: string | null;
    indirizzoFatturazione?: string | null;
  };
}

export interface UnifiedProfilesResponse {
  data: UnifiedProfile[];
  total: number;
  limit: number;
  offset: number;
  meta: {
    profileTypeOptions: Array<{ value: ProfileTypeFilter; label: string }>;
    qualityLevels: Array<{
      value: 'ALTA' | 'MEDIA' | 'BASSA';
      label: string;
      minPercent: number;
    }>;
  };
}

export interface FetchProfilesParams {
  type?: ProfileTypeFilter;
  search?: string;
  companyId?: number;
  active?: boolean;
  limit?: number;
  offset?: number;
}

export async function fetchUnifiedProfiles(
  params: FetchProfilesParams
): Promise<UnifiedProfilesResponse> {
  const query = new URLSearchParams();

  if (params.type) query.set('type', params.type);
  if (params.search) query.set('search', params.search);
  if (typeof params.companyId === 'number')
    query.set('companyId', String(params.companyId));
  if (typeof params.active === 'boolean')
    query.set('active', params.active ? 'true' : 'false');
  if (typeof params.limit === 'number')
    query.set('limit', String(params.limit));
  if (typeof params.offset === 'number')
    query.set('offset', String(params.offset));

  const res = await fetch(`/api/profiles?${query.toString()}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Errore durante il caricamento dei profili');
  }

  const data = (await res.json()) as UnifiedProfilesResponse;
  return data;
}
