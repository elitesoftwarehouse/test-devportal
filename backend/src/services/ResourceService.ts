import { EntityManager } from 'typeorm';
import {
  PagedResult,
  ResourceRepository,
  ResourceSearchFilters,
  ResourceSearchOptions
} from '../repositories/ResourceRepository';
import { Resource } from '../entities/Resource';

export class ResourceService {
  private readonly repository: ResourceRepository;

  constructor(manager: EntityManager) {
    this.repository = new ResourceRepository(manager);
  }

  public async searchResources(
    filters: ResourceSearchFilters,
    options: ResourceSearchOptions
  ): Promise<PagedResult<Resource>> {
    const safeFilters: ResourceSearchFilters = {
      name: filters.name ?? null,
      role: filters.role ?? null,
      skills: filters.skills ?? null,
      skillsMatchMode: filters.skillsMatchMode ?? 'ANY'
    };

    const page = !options || options.page == null ? 1 : options.page;
    const pageSize = !options || options.pageSize == null ? 20 : options.pageSize;

    return this.repository.searchResources(safeFilters, { page, pageSize });
  }
}
