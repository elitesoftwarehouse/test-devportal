import { Request, Response, Router } from 'express';
import { getManager } from 'typeorm';
import { ResourceService } from '../services/ResourceService';
import { ResourceSearchFilters } from '../repositories/ResourceRepository';
import { ensureAuthenticated } from '../middleware/authMiddleware';
import { ensureAdmin } from '../middleware/authorizationMiddleware';

const router = Router();

router.get('/resources/search', ensureAuthenticated, ensureAdmin, async (req: Request, res: Response) => {
  const manager = getManager();
  const service = new ResourceService(manager);

  const name = (req.query.name as string) || null;
  const role = (req.query.role as string) || null;
  const skillsParam = (req.query.skills as string) || '';
  const skills = skillsParam
    ? skillsParam
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : null;

  const skillsMatchModeParam = (req.query.skillsMatchMode as string) || 'ANY';
  const skillsMatchMode = skillsMatchModeParam === 'ALL' ? 'ALL' : 'ANY';

  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20;

  const filters: ResourceSearchFilters = {
    name,
    role,
    skills,
    skillsMatchMode
  };

  try {
    const result = await service.searchResources(filters, { page, pageSize });
    res.json(result);
  } catch (err) {
    // Log dettagliato omesso per brevità
    res.status(500).json({ message: 'Errore durante la ricerca delle risorse' });
  }
});

export default router;
