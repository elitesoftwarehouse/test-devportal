import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export type TestRole =
  | 'EXTERNAL_OWNER'
  | 'EXTERNAL_COLLABORATOR'
  | 'IT_OPERATOR'
  | 'SYS_ADMIN';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  passwordHash: string;
  active: boolean;
  role: TestRole;
}

const DEFAULT_PASSWORD = 'P@ssw0rd!test';

export async function buildTestUser(
  role: TestRole,
  overrides?: Partial<Omit<TestUser, 'passwordHash' | 'password'>>
): Promise<TestUser> {
  const id = overrides?.id ?? uuidv4();
  const email =
    overrides?.email ?? `${role.toLowerCase()}+${id.slice(0, 8)}@example.test`;
  const password = DEFAULT_PASSWORD;
  const active = overrides?.active ?? true;

  const passwordHash = await bcrypt.hash(password, 10);

  return {
    id,
    email,
    password,
    passwordHash,
    active,
    role,
  };
}

export const TEST_PASSWORD = DEFAULT_PASSWORD;
