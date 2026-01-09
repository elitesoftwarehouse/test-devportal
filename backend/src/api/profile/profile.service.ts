import { PrismaClient } from '@prisma/client';
import { UserRole, AuthUser } from '../shared/auth.types';

const prisma = new PrismaClient();

export type ProfileType = 'PROFESSIONISTA' | 'AZIENDA' | 'COLLABORATORE' | 'ALL';

export interface GetUnifiedProfilesParams {
  type: ProfileType;
  search?: string;
  companyId?: number;
  active?: boolean;
  limit: number;
  offset: number;
  currentUser: AuthUser;
}

export interface UnifiedProfileQualityField {
  key: string;
  label: string;
  criticalFor: Array<'ODL' | 'CV' | 'FATTURAZIONE'>;
}

export interface UnifiedProfileQuality {
  percentComplete: number;
  level: 'ALTA' | 'MEDIA' | 'BASSA';
  missingFields: string[];
}

export interface UnifiedProfile {
  id: number;
  profileType: 'PROFESSIONISTA' | 'AZIENDA' | 'COLLABORATORE';
  name: string;
  role?: string | null; // per collaboratori
  mainContacts: {
    email?: string | null;
    phone?: string | null;
  };
  companyId?: number | null; // per collaboratori/professionisti
  companyName?: string | null;
  isActive: boolean;
  quality: UnifiedProfileQuality;
  meta: {
    profileTypeLabel: string;
    keyFields: UnifiedProfileQualityField[];
  };
  sensitive?: {
    // esposto solo se permesso
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
    profileTypeOptions: Array<{
      value: UnifiedProfile['profileType'] | 'ALL';
      label: string;
    }>;
    qualityLevels: Array<{
      value: UnifiedProfileQuality['level'];
      label: string;
      minPercent: number;
    }>;
  };
}

const QUALITY_RULES: Record<
  UnifiedProfile['profileType'],
  UnifiedProfileQualityField[]
> = {
  PROFESSIONISTA: [
    {
      key: 'email',
      label: 'Email',
      criticalFor: ['ODL', 'CV'],
    },
    {
      key: 'phone',
      label: 'Telefono',
      criticalFor: ['ODL'],
    },
    {
      key: 'codiceFiscale',
      label: 'Codice Fiscale',
      criticalFor: ['FATTURAZIONE'],
    },
    {
      key: 'indirizzoFatturazione',
      label: 'Indirizzo di fatturazione',
      criticalFor: ['FATTURAZIONE'],
    },
  ],
  AZIENDA: [
    {
      key: 'email',
      label: 'Email principale',
      criticalFor: ['ODL', 'FATTURAZIONE'],
    },
    {
      key: 'phone',
      label: 'Telefono sede',
      criticalFor: ['ODL'],
    },
    {
      key: 'partitaIva',
      label: 'Partita IVA',
      criticalFor: ['FATTURAZIONE'],
    },
    {
      key: 'indirizzoFatturazione',
      label: 'Indirizzo di fatturazione',
      criticalFor: ['FATTURAZIONE'],
    },
  ],
  COLLABORATORE: [
    {
      key: 'email',
      label: 'Email',
      criticalFor: ['ODL'],
    },
    {
      key: 'phone',
      label: 'Telefono',
      criticalFor: ['ODL'],
    },
  ],
};

function computeQuality(
  profileType: UnifiedProfile['profileType'],
  values: {
    email?: string | null;
    phone?: string | null;
    codiceFiscale?: string | null;
    partitaIva?: string | null;
    indirizzoFatturazione?: string | null;
  }
): UnifiedProfileQuality {
  const rules = QUALITY_RULES[profileType];
  const total = rules.length;
  const missing: string[] = [];

  rules.forEach((rule) => {
    const value = (values as any)[rule.key];
    if (!value || String(value).trim() === '') {
      missing.push(rule.key);
    }
  });

  const completed = total - missing.length;
  const percent = total === 0 ? 100 : Math.round((completed / total) * 100);

  let level: UnifiedProfileQuality['level'];
  if (percent >= 80) {
    level = 'ALTA';
  } else if (percent >= 50) {
    level = 'MEDIA';
  } else {
    level = 'BASSA';
  }

  return {
    percentComplete: percent,
    level,
    missingFields: missing,
  };
}

function canViewSensitive(currentUser: AuthUser): boolean {
  return currentUser.role === UserRole.ADMIN;
}

export async function getUnifiedProfiles(
  params: GetUnifiedProfilesParams
): Promise<UnifiedProfilesResponse> {
  const { type, search, companyId, active, limit, offset, currentUser } = params;

  const whereProfessionista: any = {};
  const whereAzienda: any = {};
  const whereCollaboratore: any = {};

  if (search) {
    const searchCond = {
      contains: search,
      mode: 'insensitive' as const,
    };
    whereProfessionista.OR = [
      { nome: searchCond },
      { cognome: searchCond },
      { email: searchCond },
    ];
    whereAzienda.OR = [
      { ragioneSociale: searchCond },
      { email: searchCond },
      { partitaIva: searchCond },
    ];
    whereCollaboratore.OR = [
      { nome: searchCond },
      { cognome: searchCond },
      { email: searchCond },
    ];
  }

  if (typeof active === 'boolean') {
    whereProfessionista.attivo = active;
    whereAzienda.attiva = active;
    whereCollaboratore.attivo = active;
  }

  if (companyId) {
    // Assunzione: professionisti e collaboratori hanno relazione con azienda
    whereProfessionista.aziendaId = companyId;
    whereCollaboratore.aziendaId = companyId;
  }

  const queries: Promise<any>[] = [];
  const countQueries: Promise<number>[] = [];

  const includeCompany = {
    azienda: {
      select: {
        id: true,
        ragioneSociale: true,
      },
    },
  };

  if (type === 'ALL' || type === 'PROFESSIONISTA') {
    queries.push(
      prisma.professionista.findMany({
        where: whereProfessionista,
        skip: offset,
        take: limit,
        include: includeCompany,
      })
    );
    countQueries.push(prisma.professionista.count({ where: whereProfessionista }));
  }

  if (type === 'ALL' || type === 'AZIENDA') {
    queries.push(
      prisma.azienda.findMany({
        where: whereAzienda,
        skip: offset,
        take: limit,
      })
    );
    countQueries.push(prisma.azienda.count({ where: whereAzienda }));
  }

  if (type === 'ALL' || type === 'COLLABORATORE') {
    queries.push(
      prisma.collaboratore.findMany({
        where: whereCollaboratore,
        skip: offset,
        take: limit,
        include: includeCompany,
      })
    );
    countQueries.push(prisma.collaboratore.count({ where: whereCollaboratore }));
  }

  const [results, counts] = await Promise.all([
    Promise.all(queries),
    Promise.all(countQueries),
  ]);

  const canSeeSensitive = canViewSensitive(currentUser);
  const unified: UnifiedProfile[] = [];

  let idx = 0;

  if (type === 'ALL' || type === 'PROFESSIONISTA') {
    const profs = results[idx] as any[];
    const profRules = QUALITY_RULES.PROFESSIONISTA;
    profs.forEach((p) => {
      const contacts = {
        email: p.email,
        phone: p.telefono,
      };
      const quality = computeQuality('PROFESSIONISTA', {
        email: p.email,
        phone: p.telefono,
        codiceFiscale: p.codiceFiscale,
        indirizzoFatturazione: p.indirizzoFatturazione,
      });

      unified.push({
        id: p.id,
        profileType: 'PROFESSIONISTA',
        name: `${p.nome} ${p.cognome}`.trim(),
        mainContacts: contacts,
        companyId: p.azienda?.id ?? null,
        companyName: p.azienda?.ragioneSociale ?? null,
        isActive: p.attivo,
        quality,
        meta: {
          profileTypeLabel: 'Professionista',
          keyFields: profRules,
        },
        sensitive: canSeeSensitive
          ? {
              codiceFiscale: p.codiceFiscale,
              partitaIva: null,
              indirizzoFatturazione: p.indirizzoFatturazione,
            }
          : undefined,
      });
    });
    idx++;
  }

  if (type === 'ALL' || type === 'AZIENDA') {
    const az = results[idx] as any[];
    const azRules = QUALITY_RULES.AZIENDA;
    az.forEach((a) => {
      const contacts = {
        email: a.email,
        phone: a.telefono,
      };
      const quality = computeQuality('AZIENDA', {
        email: a.email,
        phone: a.telefono,
        partitaIva: a.partitaIva,
        indirizzoFatturazione: a.indirizzoFatturazione,
      });

      unified.push({
        id: a.id,
        profileType: 'AZIENDA',
        name: a.ragioneSociale,
        mainContacts: contacts,
        companyId: a.id,
        companyName: a.ragioneSociale,
        isActive: a.attiva,
        quality,
        meta: {
          profileTypeLabel: 'Azienda',
          keyFields: azRules,
        },
        sensitive: canSeeSensitive
          ? {
              codiceFiscale: null,
              partitaIva: a.partitaIva,
              indirizzoFatturazione: a.indirizzoFatturazione,
            }
          : undefined,
      });
    });
    idx++;
  }

  if (type === 'ALL' || type === 'COLLABORATORE') {
    const coll = results[idx] as any[];
    const collRules = QUALITY_RULES.COLLABORATORE;
    coll.forEach((c) => {
      const contacts = {
        email: c.email,
        phone: c.telefono,
      };
      const quality = computeQuality('COLLABORATORE', {
        email: c.email,
        phone: c.telefono,
      });

      unified.push({
        id: c.id,
        profileType: 'COLLABORATORE',
        name: `${c.nome} ${c.cognome}`.trim(),
        role: c.ruolo || null,
        mainContacts: contacts,
        companyId: c.azienda?.id ?? null,
        companyName: c.azienda?.ragioneSociale ?? null,
        isActive: c.attivo,
        quality,
        meta: {
          profileTypeLabel: 'Collaboratore',
          keyFields: collRules,
        },
        sensitive: undefined,
      });
    });
    idx++;
  }

  const total = counts.reduce((acc, val) => acc + val, 0);

  const response: UnifiedProfilesResponse = {
    data: unified,
    total,
    limit,
    offset,
    meta: {
      profileTypeOptions: [
        { value: 'ALL', label: 'Tutti i profili' },
        { value: 'PROFESSIONISTA', label: 'Professionisti' },
        { value: 'AZIENDA', label: 'Aziende' },
        { value: 'COLLABORATORE', label: 'Collaboratori' },
      ],
      qualityLevels: [
        { value: 'ALTA', label: 'Alta completezza', minPercent: 80 },
        { value: 'MEDIA', label: 'Media completezza', minPercent: 50 },
        { value: 'BASSA', label: 'Bassa completezza', minPercent: 0 },
      ],
    },
  };

  return response;
}
