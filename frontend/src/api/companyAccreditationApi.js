import axios from 'axios';

export async function fetchCompanyAccreditation(companyId) {
  const response = await axios.get(`/api/companies/${companyId}/accreditation`);
  return response.data;
}

export async function updateCompanyAccreditation(companyId, payload) {
  const response = await axios.put(`/api/companies/${companyId}/accreditation`, payload);
  return response.data;
}
