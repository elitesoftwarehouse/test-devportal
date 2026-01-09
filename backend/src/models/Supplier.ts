import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface SupplierAttributes {
  id: number;
  ragioneSociale: string;
  partitaIva: string | null;
  codiceFiscale: string | null;
  codiceSdi: string | null;
  pec: string | null;
  indirizzoVia: string | null;
  indirizzoCap: string | null;
  indirizzoCitta: string | null;
  indirizzoProvincia: string | null;
  indirizzoNazione: string | null;
  telefono: string | null;
  email: string | null;
  sitoWeb: string | null;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  updatedByUserId: number | null;
}

export type SupplierCreationAttributes = Optional<
  SupplierAttributes,
  'id' |
    'partitaIva' |
    'codiceFiscale' |
    'codiceSdi' |
    'pec' |
    'indirizzoVia' |
    'indirizzoCap' |
    'indirizzoCitta' |
    'indirizzoProvincia' |
    'indirizzoNazione' |
    'telefono' |
    'email' |
    'sitoWeb' |
    'isActive' |
    'deletedAt' |
    'updatedByUserId'
>;

export class Supplier
  extends Model<SupplierAttributes, SupplierCreationAttributes>
  implements SupplierAttributes
{
  public id!: number;
  public ragioneSociale!: string;
  public partitaIva!: string | null;
  public codiceFiscale!: string | null;
  public codiceSdi!: string | null;
  public pec!: string | null;
  public indirizzoVia!: string | null;
  public indirizzoCap!: string | null;
  public indirizzoCitta!: string | null;
  public indirizzoProvincia!: string | null;
  public indirizzoNazione!: string | null;
  public telefono!: string | null;
  public email!: string | null;
  public sitoWeb!: string | null;
  public isActive!: boolean;
  public deletedAt!: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;
  public updatedByUserId!: number | null;

  static initialize(sequelize: Sequelize): void {
    Supplier.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        ragioneSociale: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        partitaIva: {
          type: DataTypes.STRING(32),
          allowNull: true,
          unique: false,
        },
        codiceFiscale: {
          type: DataTypes.STRING(32),
          allowNull: true,
        },
        codiceSdi: {
          type: DataTypes.STRING(16),
          allowNull: true,
        },
        pec: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        indirizzoVia: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        indirizzoCap: {
          type: DataTypes.STRING(16),
          allowNull: true,
        },
        indirizzoCitta: {
          type: DataTypes.STRING(128),
          allowNull: true,
        },
        indirizzoProvincia: {
          type: DataTypes.STRING(64),
          allowNull: true,
        },
        indirizzoNazione: {
          type: DataTypes.STRING(64),
          allowNull: true,
        },
        telefono: {
          type: DataTypes.STRING(64),
          allowNull: true,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        sitoWeb: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        deletedAt: {
          type: DataTypes.DATE,
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
        updatedByUserId: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'suppliers',
        paranoid: true,
        timestamps: true,
        indexes: [
          {
            unique: true,
            fields: ['partitaIva'],
            where: {
              deletedAt: null,
            },
          },
          {
            unique: false,
            fields: ['ragioneSociale'],
          },
          {
            unique: false,
            fields: ['isActive'],
          },
        ],
      }
    );
  }
}

export default Supplier;
