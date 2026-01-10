import express, { Request, Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { CvRepository } from '../../repositories/CvRepository';
import { CvService, FileStorage } from '../../services/CvService';

const upload = multer({ storage: multer.memoryStorage() });

class LocalFileStorage implements FileStorage {
  async save(buffer: Buffer, destinationPath: string): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');
    const fullPath = path.resolve('storage', destinationPath);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, buffer);
  }
}

const prisma = new PrismaClient();
const repository = new CvRepository(prisma);
const storage = new LocalFileStorage();
const service = new CvService(repository, storage);

export const cvRouter = express.Router();

cvRouter.post('/collaborators/:collaboratorId/cv', upload.single('file'), async (req: Request, res: Response) => {
  const collaboratorId = Number(req.params.collaboratorId);
  if (Number.isNaN(collaboratorId)) {
    return res.status(400).json({ code: 'CV_COLLABORATOR_INVALID', message: 'Identificativo collaboratore non valido.' });
  }

  // Placeholder controllo permessi (da integrare con security del portale)
  const hasPermission = true;
  if (!hasPermission) {
    return res.status(403).json({ code: 'CV_FORBIDDEN', message: 'Non si dispone dei permessi per caricare CV per questo collaboratore.' });
  }

  if (!req.file) {
    return res.status(400).json({ code: 'CV_FILE_MISSING', message: 'Nessun file fornito per il caricamento.' });
  }

  try {
    const cv = await service.uploadNewCv(collaboratorId, {
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype
    });
    return res.status(201).json(cv);
  } catch (error: any) {
    if (error instanceof Error && error.message === 'FILE_INVALID') {
      return res.status(400).json({ code: 'CV_FILE_INVALID', message: 'Il file fornito non è valido.' });
    }
    return res.status(500).json({ code: 'CV_UPLOAD_ERROR', message: 'Errore inatteso durante il caricamento del CV.' });
  }
});

cvRouter.get('/collaborators/:collaboratorId/cv', async (req: Request, res: Response) => {
  const collaboratorId = Number(req.params.collaboratorId);
  if (Number.isNaN(collaboratorId)) {
    return res.status(400).json({ code: 'CV_COLLABORATOR_INVALID', message: 'Identificativo collaboratore non valido.' });
  }

  const includeDeleted = req.query.includeDeleted === 'true';

  try {
    const cvs = includeDeleted ? await service.listAllHistory(collaboratorId) : await service.listActiveCvs(collaboratorId);
    return res.status(200).json(cvs);
  } catch (error) {
    return res.status(500).json({ code: 'CV_LIST_ERROR', message: 'Errore durante il recupero dei CV.' });
  }
});

cvRouter.delete('/collaborators/:collaboratorId/cv/:cvId', async (req: Request, res: Response) => {
  const collaboratorId = Number(req.params.collaboratorId);
  const cvId = Number(req.params.cvId);

  if (Number.isNaN(collaboratorId) || Number.isNaN(cvId)) {
    return res.status(400).json({ code: 'CV_ID_INVALID', message: 'Identificativi non validi.' });
  }

  // Placeholder permessi
  const hasPermission = true;
  if (!hasPermission) {
    return res.status(403).json({ code: 'CV_FORBIDDEN', message: 'Non si dispone dei permessi per eliminare il CV.' });
  }

  try {
    const deleted = await service.deleteCv(collaboratorId, cvId);
    if (!deleted) {
      return res.status(404).json({ code: 'CV_NOT_FOUND', message: 'CV non trovato per il collaboratore indicato.' });
    }
    return res.status(200).json(deleted);
  } catch (error) {
    return res.status(500).json({ code: 'CV_DELETE_ERROR', message: 'Errore durante l\'eliminazione logica del CV.' });
  }
});
