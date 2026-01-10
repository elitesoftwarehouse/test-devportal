const { DataTypes, Op } = require('sequelize');
const sequelize = require('../sequelize');

// Modello Resource (Collaboratore)
// Assunzioni in linea con lo stack esistente:
// - Tabella: resources
// - Relazioni:
//   Resource.belongsTo(Role, { foreignKey: 'roleId' })
//   Resource.belongsToMany(Skill, { through: ResourceSkill })

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
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'resources',
  timestamps: true,
  indexes: [
    {
      name: 'idx_resources_full_name',
      fields: ['fullName']
    },
    {
      name: 'idx_resources_first_last_name',
      fields: ['firstName', 'lastName']
    },
    {
      name: 'idx_resources_role_id',
      fields: ['roleId']
    }
  ]
});

module.exports = {
  Resource,
  Op
};
