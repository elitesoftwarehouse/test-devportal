const { Op, Resource } = require('../models/resource');
const { Role } = require('../models/role');
const { Skill } = require('../models/skill');
require('../models/associations');

/**
 * Specifica tecnica query di ricerca risorse
 *
 * Filtri supportati:
 * - name: match parziale case-insensitive su firstName, lastName o fullName
 * - roleIds: singolo roleId o array di roleId
 * - skillIds: array di skillId
 * - skillMatch: 'ALL' | 'ANY' (default 'ALL')
 *
 * Decisione filtro skills:
 * - Comportamento di default: match ALL (la risorsa deve avere tutte le skills specificate)
 * - Opzione configurabile via parametro skillMatch=ANY per match di almeno una skill
 * - Questa scelta è documentata per validazione con il PO.
 *
 * Esempi di query SQL (semplificate):
 *
 * 1) Filtro per nome (parziale, case-insensitive):
 *    SELECT * FROM resources r
 *    WHERE LOWER(r.first_name) LIKE LOWER('%term%')
 *       OR LOWER(r.last_name) LIKE LOWER('%term%')
 *       OR LOWER(r.full_name) LIKE LOWER('%term%');
 *
 * 2) Filtro per ruolo (uno o più):
 *    SELECT * FROM resources r
 *    WHERE r.role_id IN (:roleIds);
 *
 * 3) Filtro per skills:
 *    ANY (almeno una skill):
 *      SELECT DISTINCT r.*
 *      FROM resources r
 *      JOIN resource_skills rs ON rs.resource_id = r.id
 *      WHERE rs.skill_id IN (:skillIds);
 *
 *    ALL (tutte le skills):
 *      SELECT r.*
 *      FROM resources r
 *      JOIN resource_skills rs ON rs.resource_id = r.id
 *      WHERE rs.skill_id IN (:skillIds)
 *      GROUP BY r.id
 *      HAVING COUNT(DISTINCT rs.skill_id) = :skillCount;
 */

async function searchResources({ name, roleIds, skillIds, skillMatch = 'ALL', limit = 50, offset = 0 }) {
  const where = {};

  // Filtro per nome (firstName, lastName, fullName)
  if (name && typeof name === 'string' && name.trim() !== '') {
    const like = `%${name.trim()}%`;
    where[Op.or] = [
      { firstName: { [Op.iLike]: like } },
      { lastName: { [Op.iLike]: like } },
      { fullName: { [Op.iLike]: like } }
    ];
  }

  // Filtro per ruolo (uno o molti)
  if (Array.isArray(roleIds) && roleIds.length > 0) {
    where.roleId = { [Op.in]: roleIds };
  } else if (roleIds && !Array.isArray(roleIds)) {
    where.roleId = roleIds;
  }

  // Include base (ruolo e skills)
  const include = [
    {
      model: Role,
      as: 'role',
      required: false
    }
  ];

  // Filtro skills
  let having = undefined;
  let group = undefined;

  if (Array.isArray(skillIds) && skillIds.length > 0) {
    include.push({
      model: Skill,
      as: 'skills',
      through: { attributes: [] },
      required: true,
      where: {
        id: { [Op.in]: skillIds }
      }
    });

    // Match ALL vs ANY
    if (skillMatch === 'ALL') {
      // Raggruppo per risorsa e conto le skill distinte
      group = ['Resource.id', 'role.id'];
      having = sequelizeWhereCountDistinctSkills(skillIds.length);
    }
  } else {
    include.push({
      model: Skill,
      as: 'skills',
      through: { attributes: [] },
      required: false
    });
  }

  const queryOptions = {
    where,
    include,
    limit: Math.min(limit, 100),
    offset: offset || 0,
    distinct: true,
    order: [['fullName', 'ASC']]
  };

  if (group) {
    queryOptions.group = group;
  }
  if (having) {
    queryOptions.having = having;
  }

  const { rows, count } = await Resource.findAndCountAll(queryOptions);

  return {
    items: rows,
    total: typeof count === 'number' ? count : count.length,
    limit: queryOptions.limit,
    offset: queryOptions.offset
  };
}

// Helper: definisce HAVING COUNT(DISTINCT skills.id) = :skillCount in modo compatibile con Sequelize
const { fn, col, where: sequelizeWhere } = require('sequelize');

function sequelizeWhereCountDistinctSkills(skillCount) {
  return sequelizeWhere(fn('COUNT', fn('DISTINCT', col('skills.id'))), skillCount);
}

module.exports = {
  searchResources
};
