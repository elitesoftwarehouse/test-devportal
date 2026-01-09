import axios from 'axios';

export interface ExternalCollaboratorInvitationDto {
  id: number;
  externalOwnerCompanyId: number;
  externalOwnerUserId: number | null;
  invitedEmail: string;
  invitedUserId: number | null;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELED';
  token: string;
  tokenExpiry: string;
  registrationCompleted: boolean;
  firstActivationAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchExternalCollaboratorInvitations(): Promise<ExternalCollaboratorInvitationDto[]> {
  const response = await axios.get<ExternalCollaboratorInvitationDto[]>('/api/external-collaborators/invitations');
  return response.data;
}

export async function createExternalCollaboratorInvitation(email: string): Promise<ExternalCollaboratorInvitationDto> {
  const response = await axios.post<ExternalCollaboratorInvitationDto>('/api/external-collaborators/invitations', {
    email
  });
  return response.data;
}
