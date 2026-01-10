const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');
const Resource = require('./Resource');

// Modello che rappresenta i CV associati ad una risorsa
const ResourceCv = sequelize.define('ResourceCv', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  resourceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'resources',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    field: 'resource_id'
  },
  title: {
    // titolo/descrizione sintetica del CV
    type: DataTypes.STRING(255),
    allowNull: false
  },
  language: {
    // codice lingua es. "it", "en"
    type: DataTypes.STRING(10),
    allowNull: true
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'file_name'
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'mime_type'
  },
  fileSizeBytes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'file_size_bytes'
  },
  storageFileId: {
    // id nel sistema di storage (es. S3 key, id tabella files, ecc.)
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'storage_file_id'
  },
  isPrimary: {
    // flag CV principale
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_primary'
  }
}, {
  tableName: 'resource_cvs',
  timestamps: true,
  indexes: [
    {
      name: 'idx_resource_cvs_resource_id',
      fields: ['resource_id']
    }
  ]
});

Resource.hasMany(ResourceCv, {
  as: 'cvs',
  foreignKey: 'resourceId'
});

ResourceCv.belongsTo(Resource, {
  as: 'resource',
  foreignKey: 'resourceId'
});

module.exports = ResourceCv;
