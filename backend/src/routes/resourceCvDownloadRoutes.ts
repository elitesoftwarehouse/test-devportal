import { Router, Request, Response, NextFunction } from 'express';
import { getResourceCvById } from '../services/resourceCvService';
import { storageService } from '../services/storageService';
import { auditLogger } from '../services/auditLogger';
import { AuthenticatedRequest } from '../types/auth';

const router = Router();

// GET /api/resources/:id/cvs/:cvId/download
router.get(
  '/api/resources/:id/cvs/:cvId/download',
  async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    try {
      const resourceId = parseInt(req.params.id, 10);
      const cvId = parseInt(req.params.cvId, 10);

      if (Number.isNaN(resourceId) || Number.isNaN(cvId)) {
        return res.status(400).json({ message: 'Identificativi non validi.' });
      }

      if (!authReq.user) {
        return res.status(401).json({ message: 'Autenticazione richiesta.' });
      }

      if (authReq.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Permesso negato. Solo gli amministratori possono scaricare i CV.' });
      }

      const cv = await getResourceCvById(resourceId, cvId);
      if (!cv) {
        return res.status(404).json({ message: 'CV non trovato o non associato alla risorsa indicata.' });
      }

      try {
        const fileStream = await storageService.getFileStream(cv.storageReference);

        const contentType = cv.mimeType || 'application/octet-stream';
        const fileName = cv.fileName || `cv-${cvId}`;

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        if (cv.fileSize && Number.isFinite(cv.fileSize)) {
          res.setHeader('Content-Length', cv.fileSize.toString());
        }
        // Cache policy conservativa per documenti sensibili
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        auditLogger.logDownload({
          userId: authReq.user.id,
          resourceId,
          cvId,
          fileName,
          timestamp: new Date()
        });

        fileStream.on('error', (err: Error) => {
          return next(err);
        });

        return fileStream.pipe(res);
      } catch (err: any) {
        if (err && err.code === 'ENOENT') {
          return res.status(404).json({ message: 'File CV non trovato nello storage.' });
        }
        return next(err);
      }
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
