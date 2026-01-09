export interface InviteExternalCollaboratorRequest {
  email: string;
}

export interface InviteExternalCollaboratorResponse {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
  status: string;
  externalOwnerCompanyId: string;
}

export interface CompleteActivationRequest {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface CompleteActivationResponse {
  userId: string;
  role: string;
  companyId: string;
  invitationStatus: string;
}

const BASE_URL = '/api';

export async function inviteExternalCollaborator(
  payload: InviteExternalCollaboratorRequest,
): Promise<InviteExternalCollaboratorResponse> {
  const res = await fetch(`${BASE_URL}/external-collaborators/invitations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'ERRORE_INVITO_COLLABORATORE');
  }
  return data as InviteExternalCollaboratorResponse;
}

export async function completeExternalActivation(
  payload: CompleteActivationRequest,
): Promise<CompleteActivationResponse> {
  const res = await fetch(`${BASE_URL}/external-collaborators/activation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'ERRORE_ATTIVAZIONE_COLLABORATORE');
  }
  return data as CompleteActivationResponse;
}
