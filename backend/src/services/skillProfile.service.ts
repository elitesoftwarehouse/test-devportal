import { Op, WhereOptions } from 'sequelize';
import { SkillProfile } from '../models/SkillProfile';
import { SkillProfileUpsertDto } from '../dto/skillProfile.dto';

export class SkillProfileService {
  async getOrCreateForUser(userId: number) {
    let profile = await SkillProfile.findOne({ where: { userId } });
    if (!profile) {
      profile = await SkillProfile.create({ userId, keySkills: [] });
    }
    return profile;
  }

  async getForUser(userId: number) {
    return SkillProfile.findOne({ where: { userId } });
  }

  async upsertForUser(userId: number, payload: SkillProfileUpsertDto) {
    const profile = await this.getOrCreateForUser(userId);
    if (payload.role !== undefined) profile.role = payload.role;
    if (payload.keySkills !== undefined) profile.keySkills = payload.keySkills ?? [];
    if (payload.yearsOfExperience !== undefined) profile.yearsOfExperience = payload.yearsOfExperience;
    if (payload.primaryLanguage !== undefined) profile.primaryLanguage = payload.primaryLanguage;
    if (payload.summary !== undefined) profile.summary = payload.summary;
    if (payload.metadata !== undefined) profile.metadata = payload.metadata;

    await profile.save();
    return profile;
  }

  async searchForOperator(filters: {
    role?: string;
    skill?: string;
    minYears?: number;
    language?: string;
  }) {
    const where: WhereOptions = {};

    if (filters.role) {
      where['role'] = { [Op.iLike]: `%${filters.role}%` };
    }
    if (filters.language) {
      where['primaryLanguage'] = filters.language;
    }
    if (typeof filters.minYears === 'number') {
      where['yearsOfExperience'] = { [Op.gte]: filters.minYears };
    }

    const profiles = await SkillProfile.findAll({ where });

    if (filters.skill) {
      const skillLower = filters.skill.toLowerCase();
      return profiles.filter((p) =>
        Array.isArray(p.keySkills) &&
        p.keySkills.some((s: string) => String(s).toLowerCase().includes(skillLower))
      );
    }

    return profiles;
  }
}

export const skillProfileService = new SkillProfileService();
