export interface ProfessionalProfileDto {
  id?: string;
  userId?: string;
  nome: string;
  cognome: string;
  codiceFiscale?: string | null;
  partitaIva?: string | null;
  email?: string | null;
  pec?: string | null;
  telefono?: string | null;
  cellulare?: string | null;
  indirizzo?: string | null;
  cap?: string | null;
  citta?: string | null;
  provincia?: string | null;
}

const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export async function fetchMyProfessionalProfile(userId: string): Promise<ProfessionalProfileDto | null> {
  const res = await fetch(`${BASE_URL}/api/professional-profile/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error('Errore nel recupero del profilo');
  }

  return (await res.json()) as ProfessionalProfileDto;
}

export async function createProfessionalProfile(userId: string, payload: ProfessionalProfileDto): Promise<ProfessionalProfileDto> {
  const res = await fetch(`${BASE_URL}/api/professional-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const code = body.code || 'ERRORE_CREAZIONE_PROFILO';
    throw new Error(code);
  }

  return (await res.json()) as ProfessionalProfileDto;
}

export async function updateProfessionalProfile(userId: string, payload: ProfessionalProfileDto): Promise<ProfessionalProfileDto> {
  const res = await fetch(`${BASE_URL}/api/professional-profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const code = body.code || 'ERRORE_AGGIORNAMENTO_PROFILO';
    throw new Error(code);
  }

  return (await res.json()) as ProfessionalProfileDto;
}
