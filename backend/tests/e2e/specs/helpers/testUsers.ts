export type ExternalOwnerUser = {
  email: string;
  password: string;
  description: string;
};

// Utenti di test fittizi. In ambiente reale questi valori dovrebbero essere
// presi da variabili d'ambiente o da un seeder specifico per l'E2E.
export const externalOwnerNoCompany: ExternalOwnerUser = {
  email: process.env.E2E_EXTERNAL_OWNER_NO_COMPANY_EMAIL || 'owner.nocompany@example.com',
  password: process.env.E2E_EXTERNAL_OWNER_NO_COMPANY_PASSWORD || 'Password123!',
  description: 'EXTERNAL_OWNER senza azienda collegata',
};

export const externalOwnerWithCompany: ExternalOwnerUser = {
  email: process.env.E2E_EXTERNAL_OWNER_WITH_COMPANY_EMAIL || 'owner.withcompany@example.com',
  password: process.env.E2E_EXTERNAL_OWNER_WITH_COMPANY_PASSWORD || 'Password123!',
  description: 'EXTERNAL_OWNER con azienda già accreditata',
};
