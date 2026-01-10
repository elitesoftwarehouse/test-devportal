export enum CompanyCollaboratorRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER'
}

export const isValidCompanyCollaboratorRole = (role: string | undefined | null): role is CompanyCollaboratorRole => {
  if (!role) return false;
  return Object.values(CompanyCollaboratorRole).includes(role as CompanyCollaboratorRole);
};
