import axios from 'axios';

export interface ResourceCvDTO {
  id: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceDetailDTO {
  id: string;
  firstName: string;
  lastName: string;
  role: string | null;
  email: string;
  cvs: ResourceCvDTO[];
}

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export async function fetchResourceDetail(resourceId: string): Promise<ResourceDetailDTO> {
  const response = await client.get<ResourceDetailDTO>(`/resources/${resourceId}`);
  return response.data;
}

export async function downloadResourceCv(resourceId: string, cvId: string): Promise<Blob> {
  const response = await client.get(`/resources/${resourceId}/cv/${cvId}/download`, {
    responseType: 'blob',
  });
  return response.data;
}
