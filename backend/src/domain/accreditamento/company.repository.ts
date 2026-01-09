import { AccreditationState } from './company.types';

export interface CompanyRepository {
  findByVatNumber(vatNumber: string): Promise<any | null>;
  createDraft(data: any): Promise<any>;
  updateState(id: string, newState: AccreditationState): Promise<any>;
  updateFields(id: string, patch: any): Promise<any>;
}
