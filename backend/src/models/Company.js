import { DataTypes } from 'sequelize';
import { sequelize } from '../sequelize.js';

export const Company = sequelize.define(
  'Company',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: DataTypes.STRING,
    vatNumber: DataTypes.STRING,
    legalAddress: DataTypes.STRING,
    website: DataTypes.STRING,
    industry: DataTypes.STRING,
    internalNotes: DataTypes.TEXT
  },
  {
    tableName: 'companies',
    timestamps: false
  }
);
