import axios from 'axios';
import { AdminCollaboratorCv, AdminCollaboratorCvUploadResponse } from '../types/adminCollaboratorCvTypes';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

export async function fetchCollaboratorCvs(collaboratorId: string): Promise<AdminCollaboratorCv[]> {
  const res = await axios.get(`${API_BASE_URL}/admin/collaborators/${collaboratorId}/cvs`);
  return res.data as AdminCollaboratorCv[];
}

export async function uploadCollaboratorCv(collaboratorId: string, file: File): Promise<AdminCollaboratorCvUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post(`${API_BASE_URL}/admin/collaborators/${collaboratorId}/cvs`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data as AdminCollaboratorCvUploadResponse;
}

export async function deleteCollaboratorCv(collaboratorId: string, cvId: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/admin/collaborators/${collaboratorId}/cvs/${cvId}`);
}
