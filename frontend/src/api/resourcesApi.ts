import axios, { AxiosResponse } from 'axios';

export interface ResourceSkillDto {
  id: number;
  name: string;
  level: string | null;
  yearsExperience: number | null;
  category: string | null;
  tags: string[];
}

export interface ResourceCvDto {
  id: number;
  title: string;
  fileName: string;
  language: string | null;
  updatedAt: string;
  format: string | null;
  isPrimary: boolean;
}

export interface ResourceDetailDto {
  id: number;
  fullName: string;
  role: string | null;
  seniority: string | null;
  company: string | null;
  status: string | null;
  skills: ResourceSkillDto[];
  cvs: ResourceCvDto[];
}

export async function fetchResourceDetail(id: string | number): Promise<ResourceDetailDto> {
  const response: AxiosResponse<ResourceDetailDto> = await axios.get(`/api/resources/${id}`);
  return response.data;
}

export async function downloadResourceCv(resourceId: number | string, cvId: number | string): Promise<void> {
  const url = `/api/resources/${resourceId}/cv/${cvId}/download`;
  const response = await axios.get(url, { responseType: 'blob' });

  const disposition = response.headers['content-disposition'];
  let fileName = 'cv';
  if (disposition) {
    const match = disposition.match(/filename="?([^";]+)"?/i);
    if (match && match[1]) {
      fileName = decodeURIComponent(match[1]);
    }
  }

  const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
