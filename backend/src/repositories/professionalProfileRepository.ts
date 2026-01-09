import ProfessionalProfile, { ProfessionalProfileAttributes, ProfessionalProfileCreationAttributes } from '../models/ProfessionalProfile';

export interface ProfessionalProfileUpdatePayload {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date | null;
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

export class ProfessionalProfileRepository {
  async findByUserId(userId: number): Promise<ProfessionalProfile | null> {
    return ProfessionalProfile.findOne({ where: { userId } });
  }

  async createForUser(userId: number, payload: ProfessionalProfileCreationAttributes): Promise<ProfessionalProfile> {
    return ProfessionalProfile.create({
      ...payload,
      userId,
    });
  }

  async updateForUser(userId: number, payload: ProfessionalProfileUpdatePayload): Promise<ProfessionalProfile | null> {
    const profile = await this.findByUserId(userId);
    if (!profile) {
      return null;
    }
    await profile.update(payload);
    return profile;
  }
}

export const professionalProfileRepository = new ProfessionalProfileRepository();
