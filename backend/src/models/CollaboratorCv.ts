import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db';

export interface CollaboratorCvAttributes {
  id: number;
  collaboratorId: number;
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  isCurrent: boolean;
  isDeleted: boolean;
  createdBy: number | null;
  updatedBy: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CollaboratorCvCreationAttributes
  extends Optional<CollaboratorCvAttributes, 'id' | 'isCurrent' | 'isDeleted' | 'createdBy' | 'updatedBy'> {}

export class CollaboratorCv
  extends Model<CollaboratorCvAttributes, CollaboratorCvCreationAttributes>
  implements CollaboratorCvAttributes
{
  public id!: number;
  public collaboratorId!: number;
  public fileName!: string;
  public originalFileName!: string;
  public mimeType!: string;
  public fileSize!: number;
  public isCurrent!: boolean;
  public isDeleted!: boolean;
  public createdBy!: number | null;
  public updatedBy!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CollaboratorCv.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    collaboratorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    originalFileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'CollaboratorCv',
    timestamps: true,
  }
);

export default CollaboratorCv;
