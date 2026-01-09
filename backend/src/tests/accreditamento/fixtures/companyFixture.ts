import { v4 as uuidv4 } from 'uuid';

export interface TestCompanyPayload {
  name: string;
  vatNumber: string;
  countryCode: string;
  email: string;
}

export function buildMinimalDraftCompanyPayload(overrides: Partial<TestCompanyPayload> = {}): TestCompanyPayload {
  const randomSuffix = uuidv4().slice(0, 8);

  return {
    name: `Test Company ${randomSuffix}`,
    vatNumber: overrides.vatNumber ?? `IT000000${randomSuffix}`.slice(0, 11),
    countryCode: overrides.countryCode ?? 'IT',
    email: overrides.email ?? `test+${randomSuffix}@example.com`,
  };
}

export const EXISTING_VAT_NUMBER = 'IT12345678901';

export function buildCompanyWithExistingVat(): TestCompanyPayload {
  return buildMinimalDraftCompanyPayload({ vatNumber: EXISTING_VAT_NUMBER });
}
