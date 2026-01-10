import axios from 'axios';

const API_BASE_URL = '/api';

export async function fetchResourceDetails(resourceId) {
  const response = await axios.get(`${API_BASE_URL}/resources/${resourceId}/details`);
  return response.data;
}

export async function downloadResourceCv(resourceId, cvId, isAdmin = false) {
  const config = {
    responseType: 'blob',
    headers: {}
  };

  // Solo per ambiente demo: header per simulare utente admin
  if (isAdmin) {
    config.headers['X-Demo-Admin'] = 'true';
  }

  const response = await axios.get(`${API_BASE_URL}/resources/${resourceId}/cvs/${cvId}/download`, config);
  return response.data;
}
