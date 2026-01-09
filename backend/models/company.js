/* eslint-disable @typescript-eslint/no-var-requires */
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Company extends Model {
    static associate(models) {
      if (models.User) {
        Company.belongsTo(models.User, {
          as: 'owner',
          foreignKey: 'ownerUserId',
          constraints: true,
        });

        // opzionale: relazione inversa
        if (!models.User.associations || !models.User.associations.ownedCompanies) {
          models.User.hasMany(Company, {
            as: 'ownedCompanies',
            foreignKey: 'ownerUserId',
          });
        }
      }
    }
  }

  Company.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        // denominazione / ragione sociale esistente
        type: DataTypes.STRING,
        allowNull: false,
      },
      legalName: {
        // ragione_sociale formale se diversa da name
        type: DataTypes.STRING,
        allowNull: true,
        field: 'legal_name',
      },
      vatNumber: {
        // partita_iva
        type: DataTypes.STRING(32),
        allowNull: true,
        field: 'vat_number',
      },
      taxCode: {
        // codice_fiscale
        type: DataTypes.STRING(32),
        allowNull: true,
        field: 'tax_code',
      },
      legalAddressStreet: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'legal_address_street',
      },
      legalAddressPostalCode: {
        type: DataTypes.STRING(16),
        allowNull: true,
        field: 'legal_address_postal_code',
      },
      legalAddressCity: {
        type: DataTypes.STRING(128),
        allowNull: true,
        field: 'legal_address_city',
      },
      legalAddressProvince: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: 'legal_address_province',
      },
      legalAddressCountry: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: 'legal_address_country',
        defaultValue: 'Italia',
      },
      businessEmail: {
        // email aziendale di riferimento
        type: DataTypes.STRING,
        allowNull: true,
        field: 'business_email',
        validate: {
          isEmail: true,
        },
      },
      businessPhone: {
        type: DataTypes.STRING(32),
        allowNull: true,
        field: 'business_phone',
      },
      accreditationStatus: {
        // stato_accreditamento: DRAFT, PENDING_APPROVAL, ACTIVE, REJECTED
        type: DataTypes.ENUM('DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED'),
        allowNull: false,
        defaultValue: 'DRAFT',
        field: 'accreditation_status',
      },
      firstAccreditationAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'first_accreditation_at',
      },
      lastAccreditationUpdateAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_accreditation_update_at',
      },
      ownerUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'owner_user_id',
      },
    },
    {
      sequelize,
      modelName: 'Company',
      tableName: 'companies',
      underscored: true,
    }
  );

  return Company;
};
