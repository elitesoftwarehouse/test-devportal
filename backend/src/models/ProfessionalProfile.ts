import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db/sequelize';

export interface ProfessionalProfileAttributes {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date | null;
  placeOfBirth?: string | null;
  taxCode?: string | null; // codice fiscale
  vatNumber?: string | null; // partita IVA
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
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProfessionalProfileCreationAttributes = Optional<
  ProfessionalProfileAttributes,
  'id' |
  'dateOfBirth' |
  'placeOfBirth' |
  'taxCode' |
  'vatNumber' |
  'address' |
  'zipCode' |
  'city' |
  'province' |
  'country' |
  'phone' |
  'mobilePhone' |
  'email' |
  'pecEmail' |
  'sdiCode' |
  'createdAt' |
  'updatedAt'
>;

export class ProfessionalProfile extends Model<ProfessionalProfileAttributes, ProfessionalProfileCreationAttributes> implements ProfessionalProfileAttributes {
  public id!: number;
  public userId!: number;
  public firstName!: string;
  public lastName!: string;
  public dateOfBirth!: Date | null;
  public placeOfBirth!: string | null;
  public taxCode!: string | null;
  public vatNumber!: string | null;
  public address!: string | null;
  public zipCode!: string | null;
  public city!: string | null;
  public province!: string | null;
  public country!: string | null;
  public phone!: string | null;
  public mobilePhone!: string | null;
  public email!: string | null;
  public pecEmail!: string | null;
  public sdiCode!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProfessionalProfile.init(
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
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    placeOfBirth: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    taxCode: {
      type: DataTypes.STRING(16),
      allowNull: true,
    },
    vatNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Italia',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    mobilePhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pecEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sdiCode: {
      type: DataTypes.STRING(7),
      allowNull: true,
    },
  },
  {
    tableName: 'professional_profiles',
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ['userId'],
      },
    ],
  }
);

export default ProfessionalProfile;
