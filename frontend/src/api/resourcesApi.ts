import axios, { AxiosResponse } from 'axios';

export interface ResourceCvDto {
  id: number;
  fileName: string | null;
  mimeType: string | null;
  downloadUrl: string; // Deve essere coerente con l'endpoint backend /api/resources/{id}/cvs/{cvId}/download
}

export interface ResourceDetailDto {
  id: number;
  fullName: string;
  role: string;
  cvs: ResourceCvDto[];
}

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true
});

export async function getResourceDetail(resourceId: number): Promise<ResourceDetailDto> {
  const response: AxiosResponse<ResourceDetailDto> = await apiClient.get(`/resources/${resourceId}`);
  return response.data;
}

export async function downloadResourceCv(resourceId: number, cvId: number): Promise<Blob> {
  const response: AxiosResponse<Blob> = await apiClient.get(`/resources/${resourceId}/cvs/${cvId}/download`, {
    responseType: 'blob'
  });
  return response.data;
}

export default {
  getResourceDetail,
  downloadResourceCv
};
