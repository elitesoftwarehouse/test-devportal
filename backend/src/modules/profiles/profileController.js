import express from 'express';
import { enrichProfileWithCompleteness } from './profileCompletenessRules.js';
import { applyProfilePermissions, canViewProfile } from './profilePermissions.js';
import { getUnifiedProfiles } from './profileService.js';

const router = express.Router();

/**
 * Endpoint unificato di consultazione profili.
 * GET /api/profiles
 * Query params supportati (indicativi):
 * - type: PROFESSIONISTA|AZIENDA|COLLABORATORE (opzionale, filtro)
 * - limit, offset per paginazione
 */
router.get('/api/profiles', async (req, res, next) => {
  try {
    const { type, limit, offset } = req.query;

    const currentUser = {
      id: req.user && req.user.id,
      role: req.user && req.user.role ? req.user.role : 'USER',
      companyId: req.user && req.user.companyId
    };

    const options = {
      type: type || null,
      limit: limit ? parseInt(String(limit), 10) : 50,
      offset: offset ? parseInt(String(offset), 10) : 0
    };

    const { profiles, total } = await getUnifiedProfiles(options);

    // Filtraggio per permessi e arricchimento con completezza
    const resultItems = [];

    for (const profile of profiles) {
      if (!canViewProfile(profile, currentUser)) {
        continue;
      }
      const filtered = applyProfilePermissions(profile, currentUser);
      const { completeness } = enrichProfileWithCompleteness(filtered);
      resultItems.push({
        ...filtered,
        completeness
      });
    }

    res.json({
      data: resultItems,
      total,
      count: resultItems.length
    });
  } catch (err) {
    next(err);
  }
});

export default router;
