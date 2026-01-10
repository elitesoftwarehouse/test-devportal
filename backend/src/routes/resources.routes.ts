import { Router } from 'express';
import { resourcesController } from '../api/resources/resources.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Dettaglio risorsa con elenco CV
router.get('/resources/:id', authenticate, (req, res) => resourcesController.getResourceDetail(req, res));

// Download rapido CV della risorsa
router.get('/resources/:resourceId/cv/:cvId/download', authenticate, (req, res) => resourcesController.downloadResourceCv(req, res));

export default router;
