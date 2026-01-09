export enum CompanyCollaboratorStatus {
  ATTIVO = 'ATTIVO',
  INATTIVO = 'INATTIVO'
}

export const isValidCompanyCollaboratorStatus = (status: string | undefined | null): status is CompanyCollaboratorStatus => {
  if (!status) return false;
  return Object.values(CompanyCollaboratorStatus).includes(status as CompanyCollaboratorStatus);
};
