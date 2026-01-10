import axios from 'axios';

export interface SkillProfile {
  id: number;
  userId: number;
  role: string | null;
  keySkills: string[];
  yearsOfExperience: number | null;
  primaryLanguage: string | null;
  summary: string | null;
  metadata: Record<string, any> | null;
}

const client = axios.create({
  baseURL: '/api',
});

export async function fetchMySkillProfile(mockUserId?: number) {
  const headers: Record<string, string> = {};
  if (mockUserId) {
    headers['x-mock-user-id'] = String(mockUserId);
  }
  const res = await client.get<SkillProfile>('/me/skill-profile', { headers });
  return res.data;
}

export async function updateMySkillProfile(payload: Partial<SkillProfile>, mockUserId?: number) {
  const headers: Record<string, string> = {};
  if (mockUserId) {
    headers['x-mock-user-id'] = String(mockUserId);
  }
  const res = await client.put<SkillProfile>('/me/skill-profile', payload, { headers });
  return res.data;
}

export async function searchSkillProfiles(params: {
  role?: string;
  skill?: string;
  minYears?: number;
  language?: string;
}, mockUserId?: number, mockRole: 'STANDARD' | 'IT_OPERATOR' | 'ADMIN' = 'IT_OPERATOR') {
  const headers: Record<string, string> = {
    'x-mock-user-role': mockRole,
  };
  if (mockUserId) {
    headers['x-mock-user-id'] = String(mockUserId);
  }
  const res = await client.get<SkillProfile[]>('/collaborators/skill-profiles', {
    params,
    headers,
  });
  return res.data;
}
