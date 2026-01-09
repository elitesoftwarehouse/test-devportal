import axios from 'axios';

export interface ProfessionalProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
  taxCode?: string | null;
  vatNumber?: string | null;
  address?: string | null;
  zipCode?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
  email?: string | null;
  pecEmail?: string | null;
  sdiCode?: string | null;
}

export interface ProfessionalProfileInput {
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
  taxCode?: string | null;
  vatNumber?: string | null;
  address?: string | null;
  zipCode?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  phone?: string | null;
  mobilePhone?: string | null;
  email?: string | null;
  pecEmail?: string | null;
  sdiCode?: string | null;
}

const client = axios.create({
  baseURL: '/api',
});

export async function fetchProfessionalProfile(): Promise<ProfessionalProfile | null> {
  try {
    const res = await client.get<{ data: ProfessionalProfile }>('/professional-profile');
    return res.data.data;
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function createProfessionalProfile(input: ProfessionalProfileInput): Promise<ProfessionalProfile> {
  const res = await client.post<{ data: ProfessionalProfile }>('/professional-profile', input);
  return res.data.data;
}

export async function updateProfessionalProfile(input: ProfessionalProfileInput): Promise<ProfessionalProfile> {
  const res = await client.put<{ data: ProfessionalProfile }>('/professional-profile', input);
  return res.data.data;
}
