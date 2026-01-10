import { EntityManager, SelectQueryBuilder } from 'typeorm';
import { Resource } from '../entities/Resource';
import { Skill } from '../entities/Skill';

export type ResourceSkillMatchMode = 'ANY' | 'ALL';

export interface ResourceSearchFilters {
  name?: string | null;
  role?: string | null;
  skills?: string[] | null;
  skillsMatchMode?: ResourceSkillMatchMode;
}

export interface ResourceSearchOptions {
  page: number;
  pageSize: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class ResourceRepository {
  private readonly manager: EntityManager;

  constructor(manager: EntityManager) {
    this.manager = manager;
  }

  public async searchResources(
    filters: ResourceSearchFilters,
    options: ResourceSearchOptions
  ): Promise<PagedResult<Resource>> {
    const page = options.page && options.page > 0 ? options.page : 1;
    const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : 20;

    const qb = this.manager
      .getRepository(Resource)
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.skills', 's');

    this.applyFilters(qb, filters);

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize
    };
  }

  public applyFilters(
    qb: SelectQueryBuilder<Resource>,
    filters: ResourceSearchFilters
  ): SelectQueryBuilder<Resource> {
    const { name, role, skills, skillsMatchMode } = filters;

    const hasName = !!(name && name.trim().length > 0);
    const hasRole = !!(role && role.trim().length > 0);
    const hasSkills = !!(skills && skills.length > 0);

    if (hasName) {
      qb.andWhere('LOWER(r.name) LIKE :name', {
        name: `%${name!.trim().toLowerCase()}%`
      });
    }

    if (hasRole) {
      qb.andWhere('LOWER(r.role) = :role', {
        role: role!.trim().toLowerCase()
      });
    }

    if (hasSkills) {
      const uniqueSkills = Array.from(new Set(skills!.map((s) => s.trim()).filter((s) => s.length > 0)));

      if (uniqueSkills.length > 0) {
        const mode: ResourceSkillMatchMode = skillsMatchMode === 'ALL' ? 'ALL' : 'ANY';

        if (mode === 'ANY') {
          qb.andWhere('s.name IN (:...skills)', { skills: uniqueSkills });
        } else {
          qb.andWhere((subQb) => {
            const sub = subQb
              .subQuery()
              .select('rs.id')
              .from(Resource, 'rs')
              .leftJoin('rs.skills', 'ss')
              .where('ss.name IN (:...allSkills)')
              .groupBy('rs.id')
              .having('COUNT(DISTINCT ss.name) >= :skillsCount')
              .getQuery();

            return 'r.id IN ' + sub;
          })
            .setParameter('allSkills', uniqueSkills)
            .setParameter('skillsCount', uniqueSkills.length);
        }
      }
    }

    return qb;
  }
}
