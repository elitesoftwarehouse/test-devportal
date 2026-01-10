import { Router, Request, Response, NextFunction } from 'express';
import { CompanyCollaboratorService } from '../services/companyCollaborator.service';
import { requireAuth } from '../middleware/requireAuth';
import { requireAdmin } from '../middleware/requireAdmin';
import { logger } from '../utils/logger';

const router = Router();
const service = new CompanyCollaboratorService();

// GET /companies/:companyId/collaborators?status=ATTIVO|INATTIVO&page=0&size=20
router.get(
  '/companies/:companyId/collaborators',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId } = req.params;
      const { status } = req.query as { status?: string };
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 0;
      const size = req.query.size ? parseInt(req.query.size as string, 10) : 20;

      const result = await service.listByCompany({
        companyId,
        status: status as 'ATTIVO' | 'INATTIVO' | undefined,
        page,
        size,
      });

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
);

// POST /companies/:companyId/collaborators
router.post(
  '/companies/:companyId/collaborators',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId } = req.params;
      const { userId, role, notes } = req.body as {
        userId: string;
        role: string;
        notes?: string;
      };

      const created = await service.createAssociation({
        companyId,
        userId,
        role,
        notes,
      });

      logger.info(
        {
          companyId,
          collaboratorId: created.id,
          userId,
          role,
          performedBy: (req as any).user?.id,
        },
        'Company collaborator association created'
      );

      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /companies/:companyId/collaborators/:id
router.put(
  '/companies/:companyId/collaborators/:id',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId, id } = req.params;
      const { role, notes } = req.body as { role?: string; notes?: string };

      const updated = await service.updateAssociation({
        id,
        companyId,
        role,
        notes,
      });

      logger.info(
        {
          companyId,
          collaboratorId: id,
          role,
          performedBy: (req as any).user?.id,
        },
        'Company collaborator association updated'
      );

      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /companies/:companyId/collaborators/:id/status
router.patch(
  '/companies/:companyId/collaborators/:id/status',
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId, id } = req.params;
      const { status } = req.body as { status: 'ATTIVO' | 'INATTIVO' };

      const updated = await service.updateStatus({
        id,
        companyId,
        status,
      });

      logger.info(
        {
          companyId,
          collaboratorId: id,
          status,
          performedBy: (req as any).user?.id,
        },
        'Company collaborator association status changed'
      );

      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
