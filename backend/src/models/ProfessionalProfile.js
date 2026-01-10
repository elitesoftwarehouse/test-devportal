import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { Company } from './Company.js';

export const ProfessionalProfile = sequelize.define(
  'ProfessionalProfile',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    role: DataTypes.STRING,
    skills: {
      type: DataTypes.JSON,
      allowNull: true
    },
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    linkedinUrl: DataTypes.STRING,
    taxCode: DataTypes.STRING,
    salary: DataTypes.DECIMAL,
    internalNotes: DataTypes.TEXT
  },
  {
    tableName: 'professional_profiles',
    timestamps: false
  }
);

ProfessionalProfile.belongsTo(Company, {
  as: 'company',
  foreignKey: 'companyId'
});
