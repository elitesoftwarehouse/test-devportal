import { DataSource } from 'typeorm';
import { UserCompanyOwnershipRepository } from '../../domain/accreditamento/userCompanyOwnership.repository';
import { UserCompanyOwnership } from '../../models/UserCompanyOwnership';

export class UserCompanyOwnershipRepositoryImpl implements UserCompanyOwnershipRepository {
  constructor(private readonly dataSource: DataSource) {}

  private repo() {
    return this.dataSource.getRepository(UserCompanyOwnership);
  }

  async linkOwnerToCompany(userId: string, companyId: string, role: string): Promise<void> {
    const entity = this.repo().create({ userId, companyId, role });
    await this.repo().save(entity);
  }

  async isOwner(userId: string, companyId: string): Promise<boolean> {
    const count = await this.repo().count({ where: { userId, companyId, role: 'LEGAL_OWNER' } });
    return count > 0;
  }
}
