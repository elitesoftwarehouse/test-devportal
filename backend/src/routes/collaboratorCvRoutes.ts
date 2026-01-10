import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadCollaboratorCv,
  logicalDeleteCv,
  listCurrentCvs,
  listCvHistory,
} from '../services/collaboratorCvService';
import { requireAuth } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/authorizationMiddleware';
import { UserRole } from '../models/User';

const router = Router();

const tempUploadDir = process.env.TEMP_UPLOAD_DIR || path.join(__dirname, '../../storage/tmp');
const upload = multer({ dest: tempUploadDir });

router.post(
  '/collaborators/:id/cv',
  requireAuth,
  requireRole(UserRole.ADMIN),
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const collaboratorId = parseInt(req.params.id, 10);
      if (Number.isNaN(collaboratorId)) {
        return res.status(400).json({ message: 'Id collaboratore non valido' });
      }

      const userId = (req as any).user.id as number;
      const file = (req as any).file as Express.Multer.File;

      const cv = await uploadCollaboratorCv({ collaboratorId, file, userId });
      return res.status(201).json(cv);
    } catch (err) {
      return next(err);
    }
  }
);

router.delete(
  '/collaborators/:id/cv/:cvId',
  requireAuth,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const collaboratorId = parseInt(req.params.id, 10);
      const cvId = parseInt(req.params.cvId, 10);
      if (Number.isNaN(collaboratorId) || Number.isNaN(cvId)) {
        return res.status(400).json({ message: 'Parametri non validi' });
      }
      const userId = (req as any).user.id as number;
      await logicalDeleteCv(collaboratorId, cvId, userId);
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  '/collaborators/:id/cv',
  requireAuth,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const collaboratorId = parseInt(req.params.id, 10);
      if (Number.isNaN(collaboratorId)) {
        return res.status(400).json({ message: 'Id collaboratore non valido' });
      }
      const cvs = await listCurrentCvs(collaboratorId);
      return res.json(cvs);
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  '/collaborators/:id/cv/history',
  requireAuth,
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const collaboratorId = parseInt(req.params.id, 10);
      if (Number.isNaN(collaboratorId)) {
        return res.status(400).json({ message: 'Id collaboratore non valido' });
      }
      const cvs = await listCvHistory(collaboratorId);
      return res.json(cvs);
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
