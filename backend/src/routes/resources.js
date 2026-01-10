const express = require('express');
const router = express.Router();
const { searchResources } = require('../services/resourceSearchService');

/**
 * GET /api/resources/search
 *
 * Query params:
 * - name: string (match parziale su firstName, lastName, fullName)
 * - roleIds: string CSV o valore singolo (es. "1,2,3")
 * - skillIds: string CSV (es. "10,20")
 * - skillMatch: 'ALL' | 'ANY' (default 'ALL')
 * - limit: numero massimo risultati (default 50, max 100)
 * - offset: offset paginazione (default 0)
 */
router.get('/search', async (req, res, next) => {
  try {
    const { name, roleIds, skillIds, skillMatch, limit, offset } = req.query;

    const parsedRoleIds = roleIds
      ? String(roleIds)
          .split(',')
          .map((v) => parseInt(v, 10))
          .filter((v) => !Number.isNaN(v))
      : [];

    const parsedSkillIds = skillIds
      ? String(skillIds)
          .split(',')
          .map((v) => parseInt(v, 10))
          .filter((v) => !Number.isNaN(v))
      : [];

    const skillMatchMode = skillMatch === 'ANY' ? 'ANY' : 'ALL';

    const result = await searchResources({
      name,
      roleIds: parsedRoleIds,
      skillIds: parsedSkillIds,
      skillMatch: skillMatchMode,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0
    });

    res.json({
      success: true,
      data: {
        items: result.items,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        skillMatch: skillMatchMode
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
