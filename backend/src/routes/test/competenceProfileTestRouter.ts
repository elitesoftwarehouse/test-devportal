import { Router, Request, Response } from 'express';

/**
 * Router di supporto ai test end-to-end per il profilo competenze.
 * Non usato in produzione; montato solo in ambienti di test.
 */
const competenceProfileTestRouter = Router();

// In-memory store per simulare coerenza backend durante i test
interface TestCompetenceProfile {
  userId: string;
  role: string | null;
  keySkills: string[];
  yearsOfExperience: number | null;
  workingLanguage: string | null;
  updatedAt: string;
}

const store: { [userId: string]: TestCompetenceProfile } = {};

function getDefaultProfile(userId: string): TestCompetenceProfile {
  return {
    userId,
    role: 'Software Engineer',
    keySkills: ['Java', 'Spring', 'SQL'],
    yearsOfExperience: 5,
    workingLanguage: 'IT',
    updatedAt: new Date().toISOString()
  };
}

// Middleware molto semplice per simulare autenticazione in ambiente di test
function mockAuth(req: Request, _res: Response, next: () => void) {
  const userId = (req.headers['x-test-user-id'] as string) || 'standard-user-1';
  (req as any).user = { id: userId, role: (req.headers['x-test-user-role'] as string) || 'STANDARD_USER' };
  next();
}

competenceProfileTestRouter.use(mockAuth);

// GET profilo competenze test
competenceProfileTestRouter.get('/profile', (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user.id as string;

  const profile = store[userId] || getDefaultProfile(userId);
  store[userId] = profile;

  res.json({
    userId: profile.userId,
    role: profile.role,
    keySkills: profile.keySkills,
    yearsOfExperience: profile.yearsOfExperience,
    workingLanguage: profile.workingLanguage,
    updatedAt: profile.updatedAt
  });
});

// PUT profilo competenze test
competenceProfileTestRouter.put('/profile', (req: Request, res: Response) => {
  const user = (req as any).user;
  const userId = user.id as string;

  const { role, keySkills, yearsOfExperience, workingLanguage } = req.body || {};

  // Validazioni minime per simulare errori backend
  const errors: { field: string; message: string }[] = [];

  if (yearsOfExperience != null && typeof yearsOfExperience === 'number' && yearsOfExperience < 0) {
    errors.push({ field: 'yearsOfExperience', message: 'Anni di esperienza non può essere negativo.' });
  }

  if (!workingLanguage) {
    errors.push({ field: 'workingLanguage', message: 'Lingua di lavoro obbligatoria.' });
  }

  if (!role) {
    errors.push({ field: 'role', message: 'Ruolo obbligatorio.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validazione fallita',
      errors
    });
  }

  const existing = store[userId] || getDefaultProfile(userId);

  const updated: TestCompetenceProfile = {
    userId,
    role,
    keySkills: Array.isArray(keySkills) ? keySkills : existing.keySkills,
    yearsOfExperience,
    workingLanguage,
    updatedAt: new Date().toISOString()
  };

  store[userId] = updated;

  res.json({
    userId: updated.userId,
    role: updated.role,
    keySkills: updated.keySkills,
    yearsOfExperience: updated.yearsOfExperience,
    workingLanguage: updated.workingLanguage,
    updatedAt: updated.updatedAt
  });
});

// Endpoint per IT_OPERATOR per verificare che i dati siano filtrabili
competenceProfileTestRouter.get('/admin/profiles', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role !== 'IT_OPERATOR') {
    return res.status(403).json({ message: 'Non autorizzato' });
  }

  const {
    role,
    workingLanguage,
    minYears,
    maxYears
  } = req.query as { [key: string]: string };

  const allProfiles = Object.values(store);

  const filtered = allProfiles.filter((p) => {
    if (role && p.role !== role) return false;
    if (workingLanguage && p.workingLanguage !== workingLanguage) return false;

    if (minYears != null && minYears !== '') {
      const v = parseInt(minYears, 10);
      if (!Number.isNaN(v) && (p.yearsOfExperience ?? 0) < v) return false;
    }
    if (maxYears != null && maxYears !== '') {
      const v = parseInt(maxYears, 10);
      if (!Number.isNaN(v) && (p.yearsOfExperience ?? 0) > v) return false;
    }

    return true;
  });

  res.json({
    total: filtered.length,
    results: filtered
  });
});

export default competenceProfileTestRouter;
