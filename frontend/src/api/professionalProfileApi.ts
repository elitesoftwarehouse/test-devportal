import axios from 'axios';

export interface ProfessionalProfileDto {
  id?: number;
  userId?: number;
  firstName: string;
  lastName: string;
  birthDate?: string | null;
  birthPlace?: string | null;
  email: string;
  phone?: string | null;
  mobile?: string | null;
  addressStreet?: string | null;
  addressZip?: string | null;
  addressCity?: string | null;
  addressProvince?: string | null;
  addressCountry?: string | null;
  fiscalCode: string;
  vatNumber?: string | null;
  taxResidenceStreet?: string | null;
  taxResidenceZip?: string | null;
  taxResidenceCity?: string | null;
  taxResidenceProvince?: string | null;
  taxResidenceCountry?: string | null;
}

export async function getProfessionalProfile(): Promise<ProfessionalProfileDto | null> {
  try {
    const res = await axios.get<ProfessionalProfileDto>('/api/professional-profile');
    return res.data;
  } catch (err: any) {
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function createProfessionalProfile(payload: ProfessionalProfileDto): Promise<ProfessionalProfileDto> {
  const res = await axios.post<ProfessionalProfileDto>('/api/professional-profile', payload);
  return res.data;
}

export async function updateProfessionalProfile(payload: ProfessionalProfileDto): Promise<ProfessionalProfileDto> {
  const res = await axios.put<ProfessionalProfileDto>('/api/professional-profile', payload);
  return res.data;
}
