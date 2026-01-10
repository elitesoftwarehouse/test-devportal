import { db } from '../../database/db';

export type ResourceSearchSortBy = 'name';
export type ResourceSearchSortDirection = 'asc' | 'desc';

export interface ResourceSearchFilter {
  name?: string;
  roleId?: number;
  roles?: number[];
  skills?: string[]; // può contenere id o code, gestito nella query
  page: number;
  pageSize: number;
  sortBy: ResourceSearchSortBy;
  sortDirection: ResourceSearchSortDirection;
}

export interface ResourceSkillSummaryDto {
  id: number;
  code: string;
  name: string;
}

export interface ResourceSearchItemDto {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  role: {
    id: number;
    name: string;
  } | null;
  skills: ResourceSkillSummaryDto[];
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Servizio di ricerca risorse.
 * La logica di matching delle skills è configurata come ANY: la risorsa viene inclusa
 * se possiede almeno una delle skills indicate. Il codice è strutturato in modo
 * da poter passare facilmente ad ALL in futuro.
 */
export class ResourceSearchService {
  async searchResources(filter: ResourceSearchFilter): Promise<PagedResult<ResourceSearchItemDto>> {
    const { name, roleId, roles, skills, page, pageSize, sortBy, sortDirection } = filter;

    const offset = (page - 1) * pageSize;

    // Costruzione query base con join verso ruoli e skills (via tabella ponte ResourceSkill)
    const baseQuery = db('resources as r')
      .leftJoin('roles as ro', 'r.role_id', 'ro.id')
      .leftJoin('resource_skills as rs', 'r.id', 'rs.resource_id')
      .leftJoin('skills as s', 'rs.skill_id', 's.id')
      .where((qb) => {
        if (name) {
          const likeValue = `%${name.toLowerCase()}%`;
          qb.andWhere(function () {
            this.whereRaw('LOWER(r.first_name) LIKE ?', [likeValue])
              .orWhereRaw('LOWER(r.last_name) LIKE ?', [likeValue]);
          });
        }

        if (roleId) {
          qb.andWhere('r.role_id', roleId);
        }

        if (roles && roles.length > 0) {
          qb.andWhereIn('r.role_id', roles);
        }

        if (skills && skills.length > 0) {
          // Matching ANY skill: almeno una skill tra quelle specificate
          qb.andWhere(function () {
            this.whereIn('s.id', skills.filter((s) => /^\d+$/.test(s)).map((v) => Number(v)));
            const skillCodes = skills.filter((s) => !/^\d+$/.test(s));
            if (skillCodes.length > 0) {
              this.orWhereIn('s.code', skillCodes);
            }
          });
        }
      })
      .select(
        'r.id',
        'r.first_name',
        'r.last_name',
        'ro.id as role_id',
        'ro.name as role_name',
        's.id as skill_id',
        's.code as skill_code',
        's.name as skill_name'
      );

    // Conteggio totale elementi (distinti per risorsa)
    const countQuery = db
      .from(baseQuery.clone().as('sub'))
      .countDistinct<{ count: string }[]>({ count: 'sub.id' });

    const countResult = await countQuery;
    const totalItems = parseInt(countResult[0]?.count || '0', 10);

    // Ordinamento (per ora solo per nome)
    if (sortBy === 'name') {
      baseQuery.orderByRaw('LOWER(r.last_name) ' + sortDirection + ', LOWER(r.first_name) ' + sortDirection);
    }

    baseQuery.limit(pageSize).offset(offset);

    const rows = await baseQuery;

    const resourcesMap = new Map<number, ResourceSearchItemDto>();

    for (const row of rows as any[]) {
      const resourceId = row.id as number;
      if (!resourcesMap.has(resourceId)) {
        const item: ResourceSearchItemDto = {
          id: resourceId,
          firstName: row.first_name,
          lastName: row.last_name,
          fullName: `${row.first_name} ${row.last_name}`.trim(),
          role: row.role_id
            ? {
                id: row.role_id,
                name: row.role_name,
              }
            : null,
          skills: [],
        };
        resourcesMap.set(resourceId, item);
      }

      if (row.skill_id) {
        const existing = resourcesMap.get(resourceId)!;
        if (!existing.skills.find((s) => s.id === row.skill_id)) {
          existing.skills.push({
            id: row.skill_id,
            code: row.skill_code,
            name: row.skill_name,
          });
        }
      }
    }

    const items = Array.from(resourcesMap.values());
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);

    return {
      items,
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  }
}
