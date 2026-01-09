import { DataSource } from 'typeorm';
import { CompanyRepository } from '../../domain/accreditamento/company.repository';
import { AccreditationState } from '../../domain/accreditamento/company.types';
import { Company } from '../../models/Company';

export class CompanyRepositoryImpl implements CompanyRepository {
  constructor(private readonly dataSource: DataSource) {}

  private repo() {
    return this.dataSource.getRepository(Company);
  }

  async findByVatNumber(vatNumber: string): Promise<any | null> {
    return this.repo().findOne({ where: { vatNumber } });
  }

  async createDraft(data: any): Promise<any> {
    const entity = this.repo().create({
      ...data,
      accreditationState: AccreditationState.DRAFT,
    });
    const saved = await this.repo().save(entity);
    return saved;
  }

  async updateState(id: string, newState: AccreditationState): Promise<any> {
    await this.repo().update({ id }, { accreditationState: newState });
    const updated = await this.repo().findOne({ where: { id } });
    if (!updated) {
      throw new Error('Company not found');
    }
    return updated;
  }

  async updateFields(id: string, patch: any): Promise<any> {
    await this.repo().update({ id }, patch);
    const updated = await this.repo().findOne({ where: { id } });
    if (!updated) {
      throw new Error('Company not found');
    }
    return updated;
  }
}
