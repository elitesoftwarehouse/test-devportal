export interface InviteExternalCollaboratorPayload {
  email: string;
  externalOwnerId: string;
  externalOwnerName: string;
  externalOwnerCompanyName: string;
  externalOwnerSupportEmail?: string;
  locale?: string;
}

export interface InviteExternalCollaboratorResponse {
  invitationId: string;
  invitedEmail: string;
  expiresAt: string;
}

export const inviteExternalCollaborator = async (
  payload: InviteExternalCollaboratorPayload
): Promise<InviteExternalCollaboratorResponse> => {
  const response = await fetch('/api/external-collaborators/invitations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const errorCode = errorBody?.error || 'UNKNOWN_ERROR';
    throw new Error(errorCode);
  }

  return (await response.json()) as InviteExternalCollaboratorResponse;
};
