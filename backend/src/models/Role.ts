import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../sequelize';

export interface RoleAttributes {
  id: number;
  name: string;
  description?: string | null;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'description'> {}

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
  public description!: string | null;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    tableName: 'roles',
    sequelize
  }
);
