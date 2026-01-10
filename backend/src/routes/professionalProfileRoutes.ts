import { Router, Request, Response } from 'express';
import { getDataSource } from '../utils/dataSource';
import { ProfessionalProfile } from '../models/ProfessionalProfile';
import { ProfessionalProfileService } from '../services/ProfessionalProfileService';

const router = Router();

function getService(): ProfessionalProfileService {
  const ds = getDataSource();
  const repo = ds.getRepository(ProfessionalProfile);
  return new ProfessionalProfileService(repo);
}

// Middleware semplice per ottenere userId autenticato
function getAuthenticatedUserId(req: Request): string {
  // Supponiamo che l'ID utente sia in req.user.id (iniettato dal middleware di auth globale)
  const anyReq: any = req as any;
  if (!anyReq.user || !anyReq.user.id) {
    throw new Error('UNAUTHENTICATED');
  }
  return String(anyReq.user.id);
}

router.get('/api/professional-profile/me', async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const service = getService();
    const profile = await service.getProfileByUserId(userId, userId);
    res.json(profile);
  } catch (err: any) {
    if (err.message === 'PROFILE_NOT_FOUND') {
      return res.status(404).json({ code: 'PROFILE_NOT_FOUND' });
    }
    if (err.message === 'FORBIDDEN') {
      return res.status(403).json({ code: 'FORBIDDEN' });
    }
    if (err.message === 'UNAUTHENTICATED') {
      return res.status(401).json({ code: 'UNAUTHENTICATED' });
    }
    res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

router.post('/api/professional-profile', async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const service = getService();
    const profile = await service.createProfileForUser(userId, req.body);
    res.status(201).json(profile);
  } catch (err: any) {
    if (err.message === 'PROFILE_ALREADY_EXISTS') {
      return res.status(409).json({ code: 'PROFILE_ALREADY_EXISTS' });
    }
    if (err.message === 'VALIDATION_ERROR') {
      return res.status(400).json({ code: 'VALIDATION_ERROR', details: (err as any).details || [] });
    }
    if (err.message === 'FORBIDDEN') {
      return res.status(403).json({ code: 'FORBIDDEN' });
    }
    if (err.message === 'UNAUTHENTICATED') {
      return res.status(401).json({ code: 'UNAUTHENTICATED' });
    }
    res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

router.put('/api/professional-profile', async (req: Request, res: Response) => {
  try {
    const userId = getAuthenticatedUserId(req);
    const service = getService();
    const profile = await service.updateProfileForUser(userId, req.body);
    res.json(profile);
  } catch (err: any) {
    if (err.message === 'PROFILE_NOT_FOUND') {
      return res.status(404).json({ code: 'PROFILE_NOT_FOUND' });
    }
    if (err.message === 'VALIDATION_ERROR') {
      return res.status(400).json({ code: 'VALIDATION_ERROR', details: (err as any).details || [] });
    }
    if (err.message === 'FORBIDDEN') {
      return res.status(403).json({ code: 'FORBIDDEN' });
    }
    if (err.message === 'UNAUTHENTICATED') {
      return res.status(401).json({ code: 'UNAUTHENTICATED' });
    }
    res.status(500).json({ code: 'INTERNAL_ERROR' });
  }
});

export default router;
