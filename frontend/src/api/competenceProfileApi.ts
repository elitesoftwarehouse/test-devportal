import axios, { AxiosInstance } from 'axios';

const httpClient: AxiosInstance = axios.create({
  baseURL: '/api',
});

export interface CompetenceProfileDTO {
  role: string | null;
  keySkills: string[];
  yearsOfExperience: number | null;
  primaryLanguage: string | null;
}

export async function getCompetenceProfile(): Promise<CompetenceProfileDTO> {
  const response = await httpClient.get<CompetenceProfileDTO>('/competence-profile');
  return response.data;
}

export async function updateCompetenceProfile(payload: CompetenceProfileDTO): Promise<CompetenceProfileDTO> {
  const response = await httpClient.put<CompetenceProfileDTO>('/competence-profile', payload);
  return response.data;
}
