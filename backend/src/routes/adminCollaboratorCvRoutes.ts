import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../config/dataSource';
import { CollaboratorCv } from '../models/CollaboratorCv';
import { Collaborator } from '../models/Collaborator';
import { requireAdmin } from '../middleware/requireAdmin';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

const uploadDir = process.env.CV_UPLOAD_DIR || path.join(process.cwd(), 'storage', 'cvs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `cv-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Formato file non supportato'));
    }
    cb(null, true);
  },
});

router.get('/admin/collaborators/:id/cvs', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const repo = AppDataSource.getRepository(CollaboratorCv);
  const cvs = await repo.find({
    where: { collaboratorId: id },
    relations: ['uploadedBy'],
    order: { createdAt: 'DESC' },
  });

  res.json(
    cvs.map((cv) => ({
      id: cv.id,
      fileName: cv.fileName,
      status: cv.status,
      uploadedAt: cv.createdAt,
      uploadedBy: cv.uploadedBy
        ? { id: cv.uploadedBy.id, displayName: cv.uploadedBy.displayName || cv.uploadedBy.email }
        : null,
      fileSizeBytes: cv.fileSizeBytes,
      mimeType: cv.mimeType,
    }))
  );
});

router.post(
  '/admin/collaborators/:id/cvs',
  authMiddleware,
  requireAdmin,
  upload.single('file'),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const file = (req as any).file as Express.Multer.File | undefined;

    if (!file) {
      return res.status(400).json({ message: 'File mancante' });
    }

    const collaboratorRepo = AppDataSource.getRepository(Collaborator);
    const collab = await collaboratorRepo.findOne({ where: { id } });
    if (!collab) {
      fs.unlink(file.path, () => undefined);
      return res.status(404).json({ message: 'Collaboratore non trovato' });
    }

    const cvRepo = AppDataSource.getRepository(CollaboratorCv);

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(
        CollaboratorCv,
        { collaboratorId: id, status: 'CURRENT' },
        { status: 'HISTORIC' }
      );

      const cv = new CollaboratorCv();
      cv.collaboratorId = id;
      cv.fileName = file.originalname;
      cv.filePath = file.path;
      cv.mimeType = file.mimetype;
      cv.fileSizeBytes = String(file.size);
      cv.status = 'CURRENT';
      cv.uploadedByUserId = (req as any).user?.id || null;

      const saved = await queryRunner.manager.save(cv);
      await queryRunner.commitTransaction();

      return res.status(201).json({
        id: saved.id,
        fileName: saved.fileName,
        status: saved.status,
        uploadedAt: saved.createdAt,
        uploadedBy: (req as any).user
          ? { id: (req as any).user.id, displayName: (req as any).user.displayName || (req as any).user.email }
          : null,
        fileSizeBytes: saved.fileSizeBytes,
        mimeType: saved.mimeType,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      fs.unlink(file.path, () => undefined);
      return res.status(500).json({ message: 'Errore nel salvataggio del CV' });
    } finally {
      await queryRunner.release();
    }
  }
);

router.delete('/admin/collaborators/:id/cvs/:cvId', authMiddleware, requireAdmin, async (req: Request, res: Response) => {
  const { id, cvId } = req.params;
  const repo = AppDataSource.getRepository(CollaboratorCv);

  const cv = await repo.findOne({ where: { id: cvId, collaboratorId: id } });
  if (!cv) {
    return res.status(404).json({ message: 'CV non trovato' });
  }

  if (cv.status === 'DELETED') {
    return res.status(400).json({ message: 'CV già eliminato' });
  }

  cv.status = 'DELETED';
  await repo.save(cv);

  return res.json({ message: 'CV eliminato logicamente', id: cv.id, status: cv.status });
});

export default router;
