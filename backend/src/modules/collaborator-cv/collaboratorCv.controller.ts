import { Request, Response, Router } from 'express';
import { CollaboratorCvService } from './collaboratorCv.service';

const router = Router();
const service = new CollaboratorCvService();

router.get('/design/collaborator-cv', (_req: Request, res: Response) => {
  res.json({
    message: 'Design API gestione CV collaboratori',
    endpoints: {
      upload: {
        method: 'POST',
        path: '/api/collaborators/:collaboratorId/cv',
        description: 'Carica un nuovo CV e lo imposta come corrente, mantenendo gli storici.',
      },
      replace: {
        method: 'POST',
        path: '/api/collaborators/:collaboratorId/cv/:cvId/replace',
        description: 'Sostituisce un CV esistente con uno nuovo, marcando il vecchio come storico.',
      },
      logicalDelete: {
        method: 'DELETE',
        path: '/api/collaborators/:collaboratorId/cv/:cvId',
        description: 'Eliminazione logica del CV, mantenendo il file a storage.',
      },
    },
  });
});

// Endpoint mock per permettere al frontend di avere un vero URL durante la fase di design
router.post('/mock/api/collaborators/:collaboratorId/cv', async (req: Request, res: Response) => {
  try {
    const collaboratorId = String(req.params.collaboratorId);
    const { fileNameOriginale, mimeType, dimensione, caricatoreUserId, note } = req.body || {};
    if (!fileNameOriginale || !mimeType || !dimensione || !caricatoreUserId) {
      return res.status(400).json({ error: 'Parametri obbligatori mancanti' });
    }
    const created = await service.uploadNew({
      collaboratorId,
      fileNameOriginale,
      mimeType,
      dimensione: Number(dimensione),
      caricatoreUserId,
      note: note || null,
    });
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Errore interno' });
  }
});

export default router;
