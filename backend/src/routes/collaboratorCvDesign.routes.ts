import { Router } from 'express';
import collaboratorCvController from '../modules/collaborator-cv/collaboratorCv.controller';

const router = Router();

router.use(collaboratorCvController);

export default router;
