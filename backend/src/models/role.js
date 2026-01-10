const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  }
}, {
  tableName: 'roles',
  timestamps: false,
  indexes: [
    {
      name: 'idx_roles_name',
      fields: ['name']
    }
  ]
});

module.exports = {
  Role
};
