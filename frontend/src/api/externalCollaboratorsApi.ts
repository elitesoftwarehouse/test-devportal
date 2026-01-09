import axios from 'axios';

const API_BASE_URL = '/api';

export interface CreateExternalInvitationPayload {
  email: string;
  firstName?: string;
  lastName?: string;
  message?: string;
  companyId: string;
}

export interface ExternalInvitationSummary {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
  companyId: string;
}

export interface InvitationDetails {
  email: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string;
  expiresAt: string;
  status: string;
}

export async function createExternalCollaboratorInvitation(
  payload: CreateExternalInvitationPayload
): Promise<ExternalInvitationSummary> {
  const response = await axios.post(`${API_BASE_URL}/external-collaborators/invitations`, payload);
  return response.data;
}

export async function getExternalInvitationDetails(token: string): Promise<InvitationDetails> {
  const response = await axios.get(`${API_BASE_URL}/external-collaborators/invitations/${token}`);
  return response.data;
}

export interface CompleteInvitationPayload {
  password: string;
  firstName: string;
  lastName: string;
  acceptPrivacy: boolean;
  acceptTerms: boolean;
}

export async function completeExternalInvitation(
  token: string,
  payload: CompleteInvitationPayload
): Promise<any> {
  const response = await axios.post(
    `${API_BASE_URL}/external-collaborators/invitations/${token}/accept`,
    payload
  );
  return response.data;
}
