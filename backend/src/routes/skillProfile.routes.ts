import { Router, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { requireAuth, requireRole } from '../middleware/authRole';
import { skillProfileService } from '../services/skillProfile.service';
import {
  mapSkillProfileToDto,
  validateSkillProfileSearch,
  validateSkillProfileUpsert,
} from '../dto/skillProfile.dto';

const router = Router();

// GET /me/skill-profile
router.get('/me/skill-profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const profile = await skillProfileService.getForUser(userId);
    if (!profile) {
      return res.status(404).json({ message: 'Profilo competenze non trovato' });
    }
    return res.json(mapSkillProfileToDto(profile));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Errore GET /me/skill-profile', err);
    return res.status(500).json({ message: 'Errore interno server' });
  }
});

// PUT /me/skill-profile
router.put(
  '/me/skill-profile',
  requireAuth,
  validateSkillProfileUpsert(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Input non valido', errors: errors.array() });
    }

    try {
      const userId = req.user!.id;
      const payload = req.body;
      const profile = await skillProfileService.upsertForUser(userId, payload);
      return res.json(mapSkillProfileToDto(profile));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Errore PUT /me/skill-profile', err);
      return res.status(500).json({ message: 'Errore interno server' });
    }
  }
);

// PATCH /me/skill-profile (alias di PUT parziale)
router.patch(
  '/me/skill-profile',
  requireAuth,
  validateSkillProfileUpsert(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Input non valido', errors: errors.array() });
    }

    try {
      const userId = req.user!.id;
      const payload = req.body;
      const profile = await skillProfileService.upsertForUser(userId, payload);
      return res.json(mapSkillProfileToDto(profile));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Errore PATCH /me/skill-profile', err);
      return res.status(500).json({ message: 'Errore interno server' });
    }
  }
);

// GET /collaborators/skill-profiles?role=...&skill=...&minYears=...&language=...
router.get(
  '/collaborators/skill-profiles',
  requireAuth,
  requireRole(['IT_OPERATOR', 'ADMIN']),
  validateSkillProfileSearch(),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Input non valido', errors: errors.array() });
    }

    try {
      const { role, skill, minYears, language } = req.query;

      const profiles = await skillProfileService.searchForOperator({
        role: role as string | undefined,
        skill: skill as string | undefined,
        minYears: typeof minYears === 'string' ? parseInt(minYears, 10) : undefined,
        language: language as string | undefined,
      });

      return res.json(profiles.map(mapSkillProfileToDto));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Errore GET /collaborators/skill-profiles', err);
      return res.status(500).json({ message: 'Errore interno server' });
    }
  }
);

export default router;
