import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

export type SupplierCompanyStatus = 'ACTIVE' | 'INACTIVE';

export interface SupplierCompanyAttributes {
  id: number;
  businessName: string; // ragione sociale
  vatNumber: string; // partita IVA
  taxCode?: string | null;
  addressStreet?: string | null;
  addressCity?: string | null;
  addressZip?: string | null;
  addressProvince?: string | null;
  addressCountry?: string | null;
  phone?: string | null;
  email?: string | null;
  pec?: string | null;
  status: SupplierCompanyStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SupplierCompanyCreationAttributes
  extends Optional<
    SupplierCompanyAttributes,
    'id' | 'taxCode' | 'addressStreet' | 'addressCity' | 'addressZip' | 'addressProvince' | 'addressCountry' | 'phone' | 'email' | 'pec' | 'status' | 'createdAt' | 'updatedAt'
  > {}

export class SupplierCompany
  extends Model<SupplierCompanyAttributes, SupplierCompanyCreationAttributes>
  implements SupplierCompanyAttributes
{
  public id!: number;
  public businessName!: string;
  public vatNumber!: string;
  public taxCode!: string | null;
  public addressStreet!: string | null;
  public addressCity!: string | null;
  public addressZip!: string | null;
  public addressProvince!: string | null;
  public addressCountry!: string | null;
  public phone!: string | null;
  public email!: string | null;
  public pec!: string | null;
  public status!: SupplierCompanyStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initModel(sequelize: Sequelize): typeof SupplierCompany {
    SupplierCompany.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        businessName: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        vatNumber: {
          type: DataTypes.STRING(20),
          allowNull: false,
          unique: true,
        },
        taxCode: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        addressStreet: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        addressCity: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        addressZip: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        addressProvince: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        addressCountry: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        phone: {
          type: DataTypes.STRING(30),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        pec: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
          allowNull: false,
          defaultValue: 'ACTIVE',
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
        tableName: 'supplier_companies',
        modelName: 'SupplierCompany',
      }
    );

    return SupplierCompany;
  }
}
