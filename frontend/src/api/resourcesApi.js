import axios from 'axios';

const API_BASE_URL = '/api';

export async function getResourceDetails(resourceId) {
  if (!resourceId) {
    throw new Error('resourceId obbligatorio');
  }
  const response = await axios.get(`${API_BASE_URL}/resources/${resourceId}/details`);
  return response.data;
}
