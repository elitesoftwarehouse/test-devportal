const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Skill = sequelize.define('Skill', {
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
  tableName: 'skills',
  timestamps: false,
  indexes: [
    {
      name: 'idx_skills_name',
      fields: ['name']
    }
  ]
});

module.exports = {
  Skill
};
