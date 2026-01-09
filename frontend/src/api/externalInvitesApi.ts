import axios from 'axios';

export interface ExternalInvite {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  sentAt: string;
  expiresAt: string | null;
  companyId: string | null;
}

export interface CreateExternalInvitePayload {
  email: string;
  firstName?: string;
  lastName?: string;
  message?: string;
  companyId?: string;
}

export async function createExternalInvite(payload: CreateExternalInvitePayload): Promise<ExternalInvite> {
  const response = await axios.post('/api/external-invites', payload);
  return response.data as ExternalInvite;
}

export async function fetchExternalInvites(companyId?: string): Promise<ExternalInvite[]> {
  const response = await axios.get('/api/external-invites', {
    params: companyId ? { companyId } : undefined
  });
  return response.data as ExternalInvite[];
}
