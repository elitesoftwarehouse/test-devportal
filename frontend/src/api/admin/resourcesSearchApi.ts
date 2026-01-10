import axios, { AxiosResponse } from 'axios';

// DTO allineati al backend adminResourcesSearchRoutes
export interface AdminResourceSummaryDto {
  id: string;
  fullName: string;
  roleName: string;
  keySkills: string[];
}

export interface AdminResourceSearchResponse {
  items: AdminResourceSummaryDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminResourceSearchFilter {
  q?: string;
  roleIds?: string[]; // verranno mappati in query param roles
  skillIds?: string[]; // verranno mappati in query param skills
  page?: number;
  pageSize?: number;
}

/**
 * Chiama l'endpoint admin di ricerca risorse.
 *
 * La funzione mostra chiaramente come i filtri UI vengono tradotti in
 * parametri di query per l'API:
 * - q -> ?q=
 * - roleIds -> ?roles=roleId1&roles=roleId2
 * - skillIds -> ?skills=skillId1&skills=skillId2
 * - page, pageSize -> paginazione server-side.
 */
export async function searchAdminResources(
  filter: AdminResourceSearchFilter,
): Promise<AdminResourceSearchResponse> {
  const params: Record<string, string | string[] | number> = {};

  if (filter.q && filter.q.trim().length > 0) {
    params.q = filter.q.trim();
  }

  if (filter.roleIds && filter.roleIds.length > 0) {
    params.roles = filter.roleIds;
  }

  if (filter.skillIds && filter.skillIds.length > 0) {
    params.skills = filter.skillIds;
  }

  if (filter.page) {
    params.page = filter.page;
  }
  if (filter.pageSize) {
    params.pageSize = filter.pageSize;
  }

  const response: AxiosResponse<AdminResourceSearchResponse> = await axios.get(
    '/api/admin/resources/search',
    { params },
  );

  return response.data;
}
