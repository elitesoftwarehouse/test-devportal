import axios from 'axios';

const API_BASE = '/api';

export async function fetchCompanyCollaborators(companyId) {
  const response = await axios.get(`${API_BASE}/companies/${companyId}/collaborators`);
  return response.data;
}

export async function fetchCollaboratorMetadata() {
  const response = await axios.get(`${API_BASE}/companies/collaborators/metadata`);
  return response.data;
}

export async function createCompanyCollaborator(companyId, payload) {
  const response = await axios.post(`${API_BASE}/companies/${companyId}/collaborators`, payload);
  return response.data;
}

export async function updateCompanyCollaborator(id, payload) {
  const response = await axios.put(`${API_BASE}/companies/collaborators/${id}`, payload);
  return response.data;
}

export async function deleteCompanyCollaborator(id) {
  await axios.delete(`${API_BASE}/companies/collaborators/${id}`);
}
