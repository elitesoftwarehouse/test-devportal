import path from 'path';
import { CollaboratorCvStorageDescriptor } from './collaboratorCv.model';

function sanitizeFileName(originalName: string): string {
  // Rimuove caratteri non ammessi e normalizza gli spazi
  return originalName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

export function buildCollaboratorCvStorageKey(
  collaboratorId: string,
  originalFileName: string,
  uploadedAt: Date = new Date()
): CollaboratorCvStorageDescriptor {
  const timestamp = uploadedAt.toISOString().replace(/[-:.TZ]/g, '');
  const ext = path.extname(originalFileName) || '.pdf';
  const baseName = path.basename(originalFileName, ext);
  const safeBaseName = sanitizeFileName(baseName) || 'cv';
  const safeExt = sanitizeFileName(ext) || '.pdf';

  const storageKey = path.posix.join(
    'collaborators',
    String(collaboratorId),
    `${timestamp}_${safeBaseName}${safeExt.startsWith('.') ? safeExt : '.' + safeExt}`
  );

  const baseDir = process.env.CV_STORAGE_BASE_DIR || path.resolve(process.cwd(), 'storage', 'cv');
  const absolutePath = path.resolve(baseDir, storageKey);

  return {
    storageKey,
    absolutePath,
  };
}
