export interface CompanyCollaboratorDto {
  id: string;
  companyId: string;
  collaboratorId: string;
  role: string;
  status: string;
}

export interface CreateCompanyCollaboratorDto {
  collaboratorId: string;
  role: string;
}

export interface UpdateCompanyCollaboratorDto {
  role: string;
}

export interface ToggleStatusDto {
  status: string;
}

const BASE_URL = '/api';

const buildHeaders = (isAdmin: boolean) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  // header usato dal mock middleware per i test/autorizzazioni
  if (isAdmin) {
    (headers as any)['x-mock-role'] = 'ADMIN';
  }
  return headers;
};

export const getCompanyCollaborators = async (companyId: string): Promise<CompanyCollaboratorDto[]> => {
  const res = await fetch(`${BASE_URL}/companies/${companyId}/collaborators`, {
    headers: buildHeaders(true)
  });
  if (!res.ok) {
    throw new Error('Errore nel caricamento collaboratori');
  }
  return res.json();
};

export const createCompanyCollaborator = async (
  companyId: string,
  payload: CreateCompanyCollaboratorDto,
  isAdmin: boolean
): Promise<CompanyCollaboratorDto> => {
  const res = await fetch(`${BASE_URL}/companies/${companyId}/collaborators`, {
    method: 'POST',
    headers: buildHeaders(isAdmin),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Errore nella creazione associazione');
  }
  return res.json();
};

export const updateCompanyCollaborator = async (
  companyId: string,
  id: string,
  payload: UpdateCompanyCollaboratorDto,
  isAdmin: boolean
): Promise<CompanyCollaboratorDto> => {
  const res = await fetch(`${BASE_URL}/companies/${companyId}/collaborators/${id}`, {
    method: 'PUT',
    headers: buildHeaders(isAdmin),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Errore nella modifica associazione');
  }
  return res.json();
};

export const toggleCompanyCollaboratorStatus = async (
  companyId: string,
  id: string,
  payload: ToggleStatusDto,
  isAdmin: boolean
): Promise<CompanyCollaboratorDto> => {
  const res = await fetch(`${BASE_URL}/companies/${companyId}/collaborators/${id}/status`, {
    method: 'PATCH',
    headers: buildHeaders(isAdmin),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Errore nel cambio stato');
  }
  return res.json();
};
