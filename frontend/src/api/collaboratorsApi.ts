import axios, { AxiosResponse } from 'axios';

export interface CollaboratorOption {
  id: number;
  name: string;
  email: string | null;
}

const BASE_URL = '/api/collaborators';

export const collaboratorsApi = {
  async listOptions(): Promise<CollaboratorOption[]> {
    const res: AxiosResponse<CollaboratorOption[]> = await axios.get(`${BASE_URL}/options`);
    return res.data;
  }
};
