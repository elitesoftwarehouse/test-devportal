export interface SendExternalCollaboratorInvitationParams {
  to: string;
  token: string;
  companyId: string;
}

export interface Mailer {
  sendExternalCollaboratorInvitation(params: SendExternalCollaboratorInvitationParams): Promise<void>;
}
