import { Router, Request, Response } from 'express';
import { CompetenceProfile } from '../models/CompetenceProfile';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// GET /api/competence-profile - profilo competenze del collaboratore corrente
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id as number;

    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    const profile = await CompetenceProfile.findOne({ where: { userId } });

    if (!profile) {
      return res.json({
        role: null,
        keySkills: [],
        yearsOfExperience: null,
        primaryLanguage: null,
      });
    }

    return res.json({
      role: profile.role,
      keySkills: profile.keySkills || [],
      yearsOfExperience: profile.yearsOfExperience,
      primaryLanguage: profile.primaryLanguage,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Errore GET /api/competence-profile', error);
    return res.status(500).json({ message: 'Errore nel recupero del profilo competenze' });
  }
});

// PUT /api/competence-profile - aggiorna o crea il profilo competenze del collaboratore corrente
router.put('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id as number;

    if (!userId) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }

    const { role, keySkills, yearsOfExperience, primaryLanguage } = req.body as {
      role?: string | null;
      keySkills?: string[] | null;
      yearsOfExperience?: number | null;
      primaryLanguage?: string | null;
    };

    const validationErrors: Record<string, string> = {};

    if (!role || typeof role !== 'string' || !role.trim()) {
      validationErrors.role = 'Il ruolo è obbligatorio.';
    } else if (role.length > 255) {
      validationErrors.role = 'Il ruolo non può superare 255 caratteri.';
    }

    if (primaryLanguage == null || typeof primaryLanguage !== 'string' || !primaryLanguage.trim()) {
      validationErrors.primaryLanguage = 'La lingua di lavoro principale è obbligatoria.';
    } else if (primaryLanguage.length > 10) {
      validationErrors.primaryLanguage = 'Il codice lingua non può superare 10 caratteri.';
    }

    if (yearsOfExperience != null) {
      if (typeof yearsOfExperience !== 'number' || Number.isNaN(yearsOfExperience)) {
        validationErrors.yearsOfExperience = 'Anni di esperienza deve essere un numero.';
      } else if (yearsOfExperience < 0) {
        validationErrors.yearsOfExperience = 'Anni di esperienza non può essere negativo.';
      } else if (yearsOfExperience > 60) {
        validationErrors.yearsOfExperience = 'Anni di esperienza non può essere maggiore di 60.';
      }
    }

    let normalizedSkills: string[] = [];
    if (Array.isArray(keySkills)) {
      normalizedSkills = keySkills
        .map((s) => (typeof s === 'string' ? s.trim() : ''))
        .filter((s) => s.length > 0);
    }

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({ message: 'Dati non validi', errors: validationErrors });
    }

    const [profile, created] = await CompetenceProfile.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        role: role!.trim(),
        keySkills: normalizedSkills,
        yearsOfExperience: yearsOfExperience ?? null,
        primaryLanguage: primaryLanguage!.trim(),
      },
    });

    if (!created) {
      profile.role = role!.trim();
      profile.keySkills = normalizedSkills;
      profile.yearsOfExperience = yearsOfExperience ?? null;
      profile.primaryLanguage = primaryLanguage!.trim();
      await profile.save();
    }

    return res.json({
      role: profile.role,
      keySkills: profile.keySkills || [],
      yearsOfExperience: profile.yearsOfExperience,
      primaryLanguage: profile.primaryLanguage,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Errore PUT /api/competence-profile', error);
    return res.status(500).json({ message: 'Errore nel salvataggio del profilo competenze' });
  }
});

export default router;
