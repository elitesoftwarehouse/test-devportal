const { Resource } = require('./resource');
const { Role } = require('./role');
const { Skill } = require('./skill');
const { ResourceSkill } = require('./resourceSkill');

// Definizione relazioni in unico punto per coerenza

Resource.belongsTo(Role, {
  foreignKey: 'roleId',
  as: 'role'
});

Resource.belongsToMany(Skill, {
  through: ResourceSkill,
  foreignKey: 'resourceId',
  otherKey: 'skillId',
  as: 'skills'
});

Skill.belongsToMany(Resource, {
  through: ResourceSkill,
  foreignKey: 'skillId',
  otherKey: 'resourceId',
  as: 'resources'
});

module.exports = {
  Resource,
  Role,
  Skill,
  ResourceSkill
};
