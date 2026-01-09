import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';
import { Company } from './Company.js';

export const CollaboratorProfile = sequelize.define(
  'CollaboratorProfile',
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
    phone: DataTypes.STRING,
    taxCode: DataTypes.STRING,
    internalNotes: DataTypes.TEXT
  },
  {
    tableName: 'collaborator_profiles',
    timestamps: false
  }
);

CollaboratorProfile.belongsTo(Company, {
  as: 'company',
  foreignKey: 'companyId'
});
