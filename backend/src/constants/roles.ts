export enum UserRole {
  EXTERNAL_OWNER = 'EXTERNAL_OWNER',
  EXTERNAL_COLLABORATOR = 'EXTERNAL_COLLABORATOR',
  IT_OPERATOR = 'IT_OPERATOR',
  SYS_ADMIN = 'SYS_ADMIN',
}

// Array utile per validazioni generiche o per popolare UI
export const ALL_ROLES: UserRole[] = [
  UserRole.EXTERNAL_OWNER,
  UserRole.EXTERNAL_COLLABORATOR,
  UserRole.IT_OPERATOR,
  UserRole.SYS_ADMIN,
];

export type RoleString = keyof typeof UserRole | UserRole;
