import axios, { AxiosResponse } from 'axios';

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

export interface ResourceSearchParams {
  name?: string;
  roleId?: number;
  roles?: number[];
  skills?: string[];
  page?: number;
  pageSize?: number;
  sortBy?: 'name';
  sortDirection?: 'asc' | 'desc';
}

export async function searchResources(
  params: ResourceSearchParams
): Promise<PagedResult<ResourceSearchItemDto>> {
  const response: AxiosResponse<PagedResult<ResourceSearchItemDto>> = await axios.get(
    '/api/resources/search',
    {
      params,
    }
  );
  return response.data;
}
