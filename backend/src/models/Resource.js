const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

// Modello Resource esistente, esteso con campi di profilo
const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  role: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  seniority: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  mainSkills: {
    // elenco sintetico di competenze principali
    type: DataTypes.TEXT,
    allowNull: true
  },
  skillTags: {
    // array di tag competenze
    type: DataTypes.JSONB,
    allowNull: true
  },
  languages: {
    // es: [{ code: 'it', level: 'madrelingua' }, { code: 'en', level: 'C1' }]
    type: DataTypes.JSONB,
    allowNull: true
  },
  availability: {
    // testo sintetico (es. "Disponibile da 01/03/2026, full-time")
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'resources',
  timestamps: true
});

module.exports = Resource;
