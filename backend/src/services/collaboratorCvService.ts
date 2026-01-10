import fs from 'fs';
import path from 'path';
import { Transaction } from 'sequelize';
import CollaboratorCv, { CollaboratorCvAttributes } from '../models/CollaboratorCv';
import Collaborator from '../models/Collaborator';
import { sequelize } from '../db';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const CV_STORAGE_DIR = process.env.CV_STORAGE_DIR || path.join(__dirname, '../../storage/cv');

function ensureStorageDir() {
  if (!fs.existsSync(CV_STORAGE_DIR)) {
    fs.mkdirSync(CV_STORAGE_DIR, { recursive: true });
  }
}

export interface UploadCvPayload {
  collaboratorId: number;
  file: Express.Multer.File;
  userId: number;
}

export async function validateCvFile(file: Express.Multer.File): Promise<void> {
  if (!file) {
    const error: any = new Error('File CV mancante');
    error.status = 400;
    throw error;
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const error: any = new Error('Tipo di file non supportato');
    error.status = 400;
    throw error;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const error: any = new Error('Dimensione file superiore al limite consentito');
    error.status = 400;
    throw error;
  }
}

async function ensureCollaboratorExists(collaboratorId: number): Promise<void> {
  const collaborator = await Collaborator.findByPk(collaboratorId);
  if (!collaborator) {
    const error: any = new Error('Collaboratore non trovato');
    error.status = 404;
    throw error;
  }
}

export async function uploadCollaboratorCv({
  collaboratorId,
  file,
  userId,
}: UploadCvPayload): Promise<CollaboratorCvAttributes> {
  await validateCvFile(file);
  await ensureCollaboratorExists(collaboratorId);
  ensureStorageDir();

  const extension = path.extname(file.originalname);
  const storedFileName = `cv_${collaboratorId}_${Date.now()}${extension}`;
  const targetPath = path.join(CV_STORAGE_DIR, storedFileName);

  await fs.promises.rename(file.path, targetPath);

  return sequelize.transaction(async (tx: Transaction) => {
    await CollaboratorCv.update(
      { isCurrent: false, updatedBy: userId },
      { where: { collaboratorId, isDeleted: false, isCurrent: true }, transaction: tx }
    );

    const cv = await CollaboratorCv.create(
      {
        collaboratorId,
        fileName: storedFileName,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        isCurrent: true,
        isDeleted: false,
        createdBy: userId,
        updatedBy: userId,
      },
      { transaction: tx }
    );

    return cv.get({ plain: true }) as CollaboratorCvAttributes;
  });
}

export async function logicalDeleteCv(
  collaboratorId: number,
  cvId: number,
  userId: number
): Promise<void> {
  await ensureCollaboratorExists(collaboratorId);

  return sequelize.transaction(async (tx: Transaction) => {
    const cv = await CollaboratorCv.findOne({
      where: { id: cvId, collaboratorId },
      transaction: tx,
    });

    if (!cv) {
      const error: any = new Error('CV non trovato');
      error.status = 404;
      throw error;
    }

    if (cv.isDeleted) {
      return;
    }

    cv.isDeleted = true;
    cv.isCurrent = false;
    cv.updatedBy = userId;
    await cv.save({ transaction: tx });

    if (cv.isCurrent) {
      const latestCv = await CollaboratorCv.findOne({
        where: { collaboratorId, isDeleted: false },
        order: [['createdAt', 'DESC']],
        transaction: tx,
      });

      if (latestCv) {
        latestCv.isCurrent = true;
        latestCv.updatedBy = userId;
        await latestCv.save({ transaction: tx });
      }
    }
  });
}

export async function listCurrentCvs(collaboratorId: number): Promise<CollaboratorCvAttributes[]> {
  await ensureCollaboratorExists(collaboratorId);

  const cvs = await CollaboratorCv.findAll({
    where: { collaboratorId, isDeleted: false },
    order: [['createdAt', 'DESC']],
  });

  return cvs.map((c) => c.get({ plain: true }) as CollaboratorCvAttributes);
}

export async function listCvHistory(collaboratorId: number): Promise<CollaboratorCvAttributes[]> {
  await ensureCollaboratorExists(collaboratorId);

  const cvs = await CollaboratorCv.findAll({
    where: { collaboratorId },
    order: [['createdAt', 'DESC']],
    paranoid: false,
  });

  return cvs.map((c) => c.get({ plain: true }) as CollaboratorCvAttributes);
}
