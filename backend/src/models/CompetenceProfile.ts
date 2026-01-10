import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export interface CompetenceProfileAttributes {
  id: number;
  userId: number;
  role: string | null;
  keySkills: string[];
  yearsOfExperience: number | null;
  primaryLanguage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CompetenceProfileCreationAttributes = Optional<
  CompetenceProfileAttributes,
  'id' | 'role' | 'keySkills' | 'yearsOfExperience' | 'primaryLanguage' | 'createdAt' | 'updatedAt'
>;

export class CompetenceProfile
  extends Model<CompetenceProfileAttributes, CompetenceProfileCreationAttributes>
  implements CompetenceProfileAttributes
{
  public id!: number;
  public userId!: number;
  public role!: string | null;
  public keySkills!: string[];
  public yearsOfExperience!: number | null;
  public primaryLanguage!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof CompetenceProfile {
    CompetenceProfile.init(
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
          type: DataTypes.STRING(255),
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
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'competence_profiles',
        modelName: 'CompetenceProfile',
      }
    );

    return CompetenceProfile;
  }
}
