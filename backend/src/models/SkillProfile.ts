import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db/sequelize';
import { User } from './User';

export interface SkillProfileAttributes {
  id: number;
  userId: number;
  role: string | null;
  keySkills: string[];
  yearsOfExperience: number | null;
  primaryLanguage: string | null; // ISO 639-1
  summary: string | null;
  metadata: Record<string, any> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SkillProfileCreationAttributes = Optional<
  SkillProfileAttributes,
  'id' | 'role' | 'keySkills' | 'yearsOfExperience' | 'primaryLanguage' | 'summary' | 'metadata'
>;

export class SkillProfile
  extends Model<SkillProfileAttributes, SkillProfileCreationAttributes>
  implements SkillProfileAttributes
{
  public id!: number;
  public userId!: number;
  public role!: string | null;
  public keySkills!: string[];
  public yearsOfExperience!: number | null;
  public primaryLanguage!: string | null;
  public summary!: string | null;
  public metadata!: Record<string, any> | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SkillProfile.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    keySkills: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    primaryLanguage: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    summary: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'skill_profiles',
    indexes: [
      {
        name: 'idx_skill_profiles_user',
        unique: true,
        fields: ['userId'],
      },
      {
        name: 'idx_skill_profiles_role',
        fields: ['role'],
      },
      {
        name: 'idx_skill_profiles_primary_language',
        fields: ['primaryLanguage'],
      },
    ],
  }
);

SkillProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(SkillProfile, { foreignKey: 'userId', as: 'skillProfile' });
