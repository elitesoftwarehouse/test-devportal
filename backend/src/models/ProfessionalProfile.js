const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

// Modello profilo Professionista collegato all'utente standard
// Utilizzato per OdL, CV e documenti fiscali

const ProfessionalProfile = sequelize.define(
  'ProfessionalProfile',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    // Dati anagrafici
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    birthPlace: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    // Recapiti
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    mobile: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    addressStreet: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    addressZip: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    addressCity: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    addressProvince: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    addressCountry: {
      type: DataTypes.STRING(2),
      allowNull: true,
      defaultValue: 'IT',
    },

    // Dati fiscali minimi
    fiscalCode: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    vatNumber: {
      type: DataTypes.STRING(11),
      allowNull: true,
    },
    taxResidenceStreet: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    taxResidenceZip: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    taxResidenceCity: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    taxResidenceProvince: {
      type: DataTypes.STRING(2),
      allowNull: true,
    },
    taxResidenceCountry: {
      type: DataTypes.STRING(2),
      allowNull: true,
      defaultValue: 'IT',
    },
  },
  {
    tableName: 'professional_profiles',
    timestamps: true,
    underscored: true,
  }
);

module.exports = ProfessionalProfile;
