import { Router, Request, Response, NextFunction } from 'express';
import { getUnifiedProfilesHandler } from './profile.controller';
import { requireAuth } from '../shared/auth.middleware';

const router = Router();

// GET /api/profiles
// Query params supportati:
// - type: 'PROFESSIONISTA' | 'AZIENDA' | 'COLLABORATORE' | 'ALL'
// - search: string (nome / cognome / ragioneSociale / email)
// - companyId: string (filtra collaboratori/professionisti per azienda)
// - active: 'true' | 'false'
// - limit, offset: paginazione
router.get(
  '/',
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    getUnifiedProfilesHandler(req, res, next);
  }
);

export default router;
