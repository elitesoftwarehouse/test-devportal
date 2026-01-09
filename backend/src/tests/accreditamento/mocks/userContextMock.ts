export type UserRole = 'EXTERNAL_OWNER' | 'ADMIN' | 'EMPLOYEE' | 'GUEST';

export interface TestUserContext {
  id: string;
  email: string;
  roles: UserRole[];
}

export function buildExternalOwnerUserContext(overrides: Partial<TestUserContext> = {}): TestUserContext {
  return {
    id: overrides.id ?? 'external-owner-1',
    email: overrides.email ?? 'owner@example.com',
    roles: overrides.roles ?? ['EXTERNAL_OWNER'],
  };
}

export function buildNonOwnerUserContext(overrides: Partial<TestUserContext> = {}): TestUserContext {
  return {
    id: overrides.id ?? 'employee-1',
    email: overrides.email ?? 'employee@example.com',
    roles: overrides.roles ?? ['EMPLOYEE'],
  };
}
