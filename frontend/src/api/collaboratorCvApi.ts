import axios from 'axios';

const BASE_URL = '/api';

export interface CollaboratorCvDto {
  id: number;
  collaboratorId: number;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  isCurrent: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function uploadCollaboratorCv(collaboratorId: number, file: File): Promise<CollaboratorCvDto> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${BASE_URL}/collaborators/${collaboratorId}/cv`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data as CollaboratorCvDto;
}

export async function deleteCollaboratorCv(collaboratorId: number, cvId: number): Promise<void> {
  await axios.delete(`${BASE_URL}/collaborators/${collaboratorId}/cv/${cvId}`);
}

export async function getCollaboratorCvs(collaboratorId: number): Promise<CollaboratorCvDto[]> {
  const response = await axios.get(`${BASE_URL}/collaborators/${collaboratorId}/cv`);
  return response.data as CollaboratorCvDto[];
}

export async function getCollaboratorCvHistory(collaboratorId: number): Promise<CollaboratorCvDto[]> {
  const response = await axios.get(`${BASE_URL}/collaborators/${collaboratorId}/cv/history`);
  return response.data as CollaboratorCvDto[];
}
