const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

// Tabella relazionale per skills chiave della risorsa con livello/proficiency

const ResourceSkill = sequelize.define('ResourceSkill', {
  resourceId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  skillId: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Livello numerico standardizzato, es. 1-5'
  },
  proficiency: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    allowNull: true
  }
}, {
  tableName: 'resource_skills',
  timestamps: false,
  indexes: [
    {
      name: 'idx_resource_skills_resource_id',
      fields: ['resourceId']
    },
    {
      name: 'idx_resource_skills_skill_id',
      fields: ['skillId']
    }
  ]
});

module.exports = {
  ResourceSkill
};
