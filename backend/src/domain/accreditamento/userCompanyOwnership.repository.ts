export interface UserCompanyOwnershipRepository {
  linkOwnerToCompany(userId: string, companyId: string, role: string): Promise<void>;
  isOwner(userId: string, companyId: string): Promise<boolean>;
}
