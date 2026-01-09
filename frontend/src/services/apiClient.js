import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

export async function registerExternalUser(payload) {
  const response = await apiClient.post('/auth/register-external', payload);
  return response.data;
}

export default apiClient;
