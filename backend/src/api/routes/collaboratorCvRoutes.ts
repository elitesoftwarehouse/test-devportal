import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Knex } from 'knex';
import { CollaboratorCvRepository } from '../../domain/collaboratorCv/CollaboratorCvRepository';
import { CollaboratorCvService } from '../../domain/collaboratorCv/CollaboratorCvService';

const router = express.Router();

// Configurazione semplice di multer per salvataggio su filesystem locale.
// Nella codebase reale, allineare al sistema di storage documentale esistente.
const uploadDir = path.resolve(process.cwd(), 'storage', 'cv');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export function createCollaboratorCvRouter(db: Knex): express.Router {
  const repository = new CollaboratorCvRepository(db);
  const service = new CollaboratorCvService(repository);

  router.post(
    '/api/collaborators/:collaboratorId/cvs',
    upload.single('file'),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { collaboratorId } = req.params;
        const file = req.file;

        if (!file) {
          return res.status(400).json({ message: 'File CV mancante' });
        }

        const versionLabel = req.body.versionLabel as string | undefined;
        const note = req.body.note as string | undefined;
        const flagIsCorrente = req.body.flagIsCorrente === 'true' || req.body.flagIsCorrente === true;

        const currentUserId = (req as any).user?.id || 'system';

        const cv = await service.uploadCv({
          collaboratorId,
          fileName: file.originalname,
          filePath: file.path,
          contentType: file.mimetype,
          fileSize: file.size,
          versionLabel,
          note,
          createdByUserId: currentUserId,
          flagIsCorrente,
        });

        res.status(201).json(cv);
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    '/api/collaborators/:collaboratorId/cvs',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { collaboratorId } = req.params;
        const includeDeleted = req.query.includeDeleted === 'true';
        const onlyCorrente = req.query.onlyCorrente === 'true';

        const list = await service.listByCollaborator({
          collaboratorId,
          includeDeleted,
          onlyCorrente,
        });

        res.json(list);
      } catch (error) {
        next(error);
      }
    }
  );

  router.post(
    '/api/collaborators/:collaboratorId/cvs/:cvId/set-corrente',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { collaboratorId, cvId } = req.params;
        const currentUserId = (req as any).user?.id || 'system';

        await service.setCvAsCorrente({
          collaboratorId,
          cvId,
          updatedByUserId: currentUserId,
        });

        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  );

  router.delete(
    '/api/collaborators/:collaboratorId/cvs/:cvId',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { cvId } = req.params;
        const currentUserId = (req as any).user?.id || 'system';

        await service.softDeleteCv({
          cvId,
          deletedByUserId: currentUserId,
        });

        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
