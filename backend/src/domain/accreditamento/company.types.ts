export enum AccreditationState {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
}

export interface CreateCompanyDraftDto {
  name: string;
  vatNumber: string;
  countryCode: string;
  email: string;
}
